# Work Package: Backend - US-0106 Secure Organizer Authentication

**Task ID**: US-2026-0106 (Tasks 94, 95, 97, 98, 99)
**Date Created**: 2026-02-08
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `backend-nextjs`

## Task Overview

Implement the backend infrastructure for organizer authentication using Supabase Auth with `@supabase/ssr`. This covers: SSR-aware Supabase client creation, database migration for organizers table with RLS, auth utility functions, server actions, logout API endpoint, and Next.js middleware for route protection.

## Execution Plan

### Step 1: Install dependency

```bash
npm install @supabase/ssr
```

### Step 2: Create SSR-aware Supabase client for middleware

**File: `src/lib/supabase/middleware.ts`** (NEW)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}
```

### Step 3: Create SSR-aware Supabase client for server components/actions

**File: `src/lib/supabase/auth-server.ts`** (NEW)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component where cookies are read-only
          }
        },
      },
    }
  );
}
```

**IMPORTANT**: Do NOT modify `src/lib/supabase/server.ts` or `src/lib/supabase/client.ts`. They serve the existing anonymous submission flow with service_role and anon key respectively. Auth must use its own SSR-aware clients.

### Step 4: Create database migration

**File: `supabase/migrations/003_create_organizers_table.sql`** (NEW)

```sql
-- Create organizers table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.organizers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizers_email ON public.organizers(email);
CREATE INDEX IF NOT EXISTS idx_organizers_created_at ON public.organizers(created_at);

-- Reuse existing updated_at trigger function from migration 001
DROP TRIGGER IF EXISTS set_updated_at_organizers ON public.organizers;
CREATE TRIGGER set_updated_at_organizers
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated organizers can view their own record
CREATE POLICY "organizers_select_own"
  ON public.organizers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS: Service role has full access to organizers
CREATE POLICY "organizers_service_role_all"
  ON public.organizers FOR ALL
  TO service_role
  USING (true);

-- Add policy on anonymous_submissions: authenticated organizers can SELECT
CREATE POLICY "organizers_read_submissions"
  ON public.anonymous_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );
```

### Step 5: Update TypeScript database types

**File: `src/types/database.types.ts`** (MODIFY)

Add the `organizers` table to the existing `Database.public.Tables` interface:

```typescript
organizers: {
  Row: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    email: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    email?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [{
    foreignKeyName: "organizers_id_fkey";
    columns: ["id"];
    referencedRelation: "users";
    referencedColumns: ["id"];
  }];
};
```

### Step 6: Create auth utility functions

**File: `src/lib/auth.ts`** (NEW)

```typescript
import { createAuthClient } from "@/lib/supabase/auth-server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createAuthClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/dashboard/login");
  }
  return session;
}

export async function isOrganizer(userId: string): Promise<boolean> {
  const supabase = await createAuthClient();
  const { data } = await supabase
    .from("organizers")
    .select("id")
    .eq("id", userId)
    .single();
  return !!data;
}
```

### Step 7: Create server actions for auth

**File: `src/lib/actions/auth.ts`** (NEW)

```typescript
"use server";

import { createAuthClient } from "@/lib/supabase/auth-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInAction(email: string, password: string) {
  const supabase = await createAuthClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Generic message to prevent username enumeration
    return { error: "Invalid email or password" };
  }

  // Verify the authenticated user is in the organizers table
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!organizer) {
    // User exists in auth but not an organizer - sign them out
    await supabase.auth.signOut();
    return { error: "You are not authorized to access the dashboard" };
  }

  revalidatePath("/dashboard", "layout");
  return { error: null };
}

export async function signOutAction() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/login");
}
```

### Step 8: Create logout API route

**File: `src/app/api/auth/logout/route.ts`** (NEW)

```typescript
import { createAuthClient } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { message: "Failed to sign out" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 9: Create Next.js middleware

**File: `middleware.ts`** (NEW, project root)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Refresh session - this is required for SSR auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/dashboard/login";
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Authenticated user on login page -> redirect to dashboard
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user on protected route -> redirect to login
  if (isProtectedRoute && !isLoginPage && !session) {
    const loginUrl = new URL("/dashboard/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated non-organizer on protected route -> sign out and redirect
  if (isProtectedRoute && !isLoginPage && session) {
    const { data: organizer } = await supabase
      .from("organizers")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (!organizer) {
      await supabase.auth.signOut();
      const loginUrl = new URL("/dashboard/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Architectural Constraints

- Use `@supabase/ssr` `createServerClient` (NOT raw `createClient` from `@supabase/supabase-js`) for all auth operations
- Keep existing `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` unchanged
- Migration number must be `003` (existing: 001, 002)
- Reuse existing `update_updated_at()` trigger function from migration 001
- Middleware must only match `/dashboard/:path*` to avoid impacting anonymous form routes
- Generic error messages in signInAction to prevent username enumeration
- Server actions use `"use server"` directive

## Dependencies

- `@supabase/ssr` npm package (to install)
- Existing: `@supabase/supabase-js`, `next`, `zod`
- Supabase project with Auth email provider enabled

## Acceptance Criteria

From US-0106:
- AC1: Supabase Auth configured with email/password
- AC3: All `/dashboard/*` routes protected by middleware
- AC4: Persistent sessions with cookie-based auth, auto-refresh
- AC5: Logout clears session and redirects
- AC6: Generic error messages, no passwords in client state/logs

## Validation Requirements

- `npm run build` succeeds with no TypeScript errors
- Middleware redirects unauthenticated users from `/dashboard` to `/dashboard/login`
- Middleware redirects authenticated users from `/dashboard/login` to `/dashboard`
- Server action signInAction returns generic error for invalid credentials
- Logout API clears session cookies

## Expected Deliverables

| File | Status |
|------|--------|
| `src/lib/supabase/middleware.ts` | NEW |
| `src/lib/supabase/auth-server.ts` | NEW |
| `supabase/migrations/003_create_organizers_table.sql` | NEW |
| `src/types/database.types.ts` | MODIFIED |
| `src/lib/auth.ts` | NEW |
| `src/lib/actions/auth.ts` | NEW |
| `src/app/api/auth/logout/route.ts` | NEW |
| `middleware.ts` | NEW |

## Journal Requirements

Maintain journal at: `fairmind/journals/US-0106_echo_backend_journal.md`
Update after each significant action or decision.
