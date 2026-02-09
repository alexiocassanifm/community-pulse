# US-0106: Secure Organizer Authentication System - Execution Plan

**Date**: 2026-02-08
**User Story**: US-2026-0106
**Project**: Meetup App
**Session**: SESSION-2026-0028 (MVP)

---

## Overview

Implement Supabase Auth-based organizer authentication for the Meetup App dashboard. This is the foundational user story for the entire dashboard epic (US-0107 through US-0114).

**Scope**: Login page, route protection middleware, session management, logout, dashboard layout.

---

## Critical Observations from Codebase Analysis

1. **No `@supabase/ssr` installed** - package.json shows `@supabase/supabase-js@^2.94.0` but NOT `@supabase/ssr`. Must install.
2. **No middleware.ts exists** - clean slate for route protection.
3. **Existing Supabase clients use raw `createClient`** - not the SSR-aware version. Auth client must be separate.
4. **Migration numbering**: existing migrations are `001_` and `002_`. New migration must be `003_`.
5. **RLS already configured** - anonymous_submissions has anon=INSERT-only, service_role=read+delete. Need to add authenticated organizer SELECT policy.
6. **shadcn/ui available**: Button, Input, Label, Card, Form, Alert, Sheet, Dialog - all needed components exist.
7. **Root layout has `<Navigation />` component** - dashboard layout must NOT duplicate this (use separate layout group).

---

## Phase 1: Backend Infrastructure (Tasks 94-95)

### Step 1.1: Install @supabase/ssr

```bash
npm install @supabase/ssr
```

### Step 1.2: Create SSR-aware Supabase client utilities

**File: `src/lib/supabase/middleware.ts`** (NEW)

Creates a Supabase client for use in Next.js middleware (edge runtime). Uses `@supabase/ssr` `createServerClient` with cookie handling via `NextRequest`/`NextResponse`.

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

**File: `src/lib/supabase/auth-server.ts`** (NEW)

Creates an SSR-aware Supabase client for server components and server actions. Uses `cookies()` from `next/headers`.

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
            // Ignore errors in Server Components (read-only)
          }
        },
      },
    }
  );
}
```

**IMPORTANT**: Do NOT modify `src/lib/supabase/server.ts` or `src/lib/supabase/client.ts`. They serve the existing anonymous submission flow and must remain untouched.

### Step 1.3: Database migration for organizers table

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

-- Trigger for updated_at (reuse existing function)
DROP TRIGGER IF EXISTS set_updated_at_organizers ON public.organizers;
CREATE TRIGGER set_updated_at_organizers
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- RLS: Organizers can view own record
CREATE POLICY "organizers_select_own"
  ON public.organizers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS: Service role has full access
CREATE POLICY "organizers_service_role_all"
  ON public.organizers FOR ALL
  TO service_role
  USING (true);

-- Update anonymous_submissions: add policy for authenticated organizers to SELECT
CREATE POLICY "organizers_read_submissions"
  ON public.anonymous_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );
```

### Step 1.4: Update TypeScript types

**File: `src/types/database.types.ts`** - Add organizers table types to existing Database interface.

Add to `Tables` within `public`:
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

### Step 1.5: Auth utility functions

**File: `src/lib/auth.ts`** (NEW)

```typescript
import { createAuthClient } from "@/lib/supabase/auth-server";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createAuthClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
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

### Step 1.6: Server actions

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
    return { error: "Invalid email or password" };
  }

  // Verify user is an organizer
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!organizer) {
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

### Step 1.7: Logout API route

**File: `src/app/api/auth/logout/route.ts`** (NEW)

```typescript
import { createAuthClient } from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
```

### Step 1.8: Next.js Middleware

**File: `middleware.ts`** (NEW, project root)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);

  const { data: { session } } = await supabase.auth.getSession();
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

  // Authenticated user on protected route -> verify organizer status
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

---

## Phase 2: Frontend - Login Page (Task 96)

### Step 2.1: Login validation schema

**File: `src/lib/validations/login.ts`** (NEW)

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### Step 2.2: Login form component

**File: `src/components/dashboard/LoginForm.tsx`** (NEW)

Client component using react-hook-form + zod. Fields: email, password. Calls `signInAction`. Shows loading state, error messages. On success, redirects to `redirectTo` param or `/dashboard`.

Key behaviors:
- Uses `useForm` with `zodResolver(loginSchema)`
- Calls `signInAction(email, password)` on submit
- Displays server error in Alert component
- Loading state on submit button
- Uses shadcn/ui: Button, Input, Label, Card, Alert
- Reads `redirectTo` from URL search params for post-login redirect
- Uses `router.push()` and `router.refresh()` on success

### Step 2.3: Login page

**File: `src/app/dashboard/login/page.tsx`** (NEW)

Server component. Renders LoginForm centered on page. Includes branding.

```typescript
import { LoginForm } from "@/components/dashboard/LoginForm";

export const metadata = {
  title: "Sign In - Dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access event analytics
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

---

## Phase 3: Frontend - Dashboard Layout & Logout (Tasks 99-100)

### Step 3.1: Logout button component

**File: `src/components/auth/LogoutButton.tsx`** (NEW)

Client component. Calls `POST /api/auth/logout`, then `router.push('/dashboard/login')` + `router.refresh()`.

### Step 3.2: Dashboard navigation

**File: `src/components/dashboard/DashboardNav.tsx`** (NEW)

Props: `user: { email: string }`. Links:
- Overview (`/dashboard`)
- Trends (`/dashboard/trends`)
- Availability (`/dashboard/availability`)
- Formats (`/dashboard/formats`)
- Demographics (`/dashboard/demographics`)

Active route highlighting via `usePathname()`. Mobile responsive with Sheet component for hamburger menu. LogoutButton integrated. User email displayed.

### Step 3.3: Dashboard layout

**File: `src/app/dashboard/layout.tsx`** (NEW)

Server component. Verifies session, renders DashboardNav + children. Does NOT include root layout Navigation (uses route group to avoid it).

```typescript
import { requireAuth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={{ email: session.user.email ?? "" }} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
```

**IMPORTANT**: The login page at `/dashboard/login` should NOT use the dashboard layout (no sidebar). Options:
- Use a route group `(auth)` for login or
- Check pathname in layout and skip nav for login route
- Recommended: Place login outside the dashboard layout scope

**Actual approach**: `/dashboard/login/page.tsx` gets its own minimal layout OR the dashboard layout conditionally renders nav only for non-login routes. The simplest approach is to NOT have a dashboard/layout.tsx wrapping login - use Next.js route groups:
- `src/app/dashboard/(auth)/login/page.tsx` - login page (no dashboard nav)
- `src/app/dashboard/(dashboard)/layout.tsx` - dashboard layout with nav
- `src/app/dashboard/(dashboard)/page.tsx` - dashboard home

### Step 3.4: Dashboard placeholder page

**File: `src/app/dashboard/(dashboard)/page.tsx`** (NEW)

Simple placeholder with welcome message and summary cards. This is a scaffold for US-0107.

---

## File Change Summary

### New Files (13)
| File | Purpose |
|------|---------|
| `src/lib/supabase/middleware.ts` | Middleware Supabase client |
| `src/lib/supabase/auth-server.ts` | SSR auth Supabase client |
| `supabase/migrations/003_create_organizers_table.sql` | DB migration |
| `src/lib/auth.ts` | Auth utility functions |
| `src/lib/actions/auth.ts` | Server actions (signIn, signOut) |
| `src/app/api/auth/logout/route.ts` | Logout API endpoint |
| `middleware.ts` | Next.js route protection |
| `src/lib/validations/login.ts` | Login Zod schema |
| `src/components/dashboard/LoginForm.tsx` | Login form component |
| `src/app/dashboard/(auth)/login/page.tsx` | Login page |
| `src/components/auth/LogoutButton.tsx` | Logout button |
| `src/components/dashboard/DashboardNav.tsx` | Dashboard navigation |
| `src/app/dashboard/(dashboard)/layout.tsx` | Dashboard layout |
| `src/app/dashboard/(dashboard)/page.tsx` | Dashboard placeholder |

### Modified Files (1)
| File | Change |
|------|--------|
| `src/types/database.types.ts` | Add organizers table types |

### Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/ssr` | latest | SSR-aware auth for Next.js |

---

## Agent Assignment

### Echo (Backend) - `backend-nextjs` skill
- Install `@supabase/ssr`
- Create `src/lib/supabase/middleware.ts`
- Create `src/lib/supabase/auth-server.ts`
- Create `supabase/migrations/003_create_organizers_table.sql`
- Update `src/types/database.types.ts`
- Create `src/lib/auth.ts`
- Create `src/lib/actions/auth.ts`
- Create `src/app/api/auth/logout/route.ts`
- Create `middleware.ts`

### Echo (Frontend) - `frontend-react-nextjs` skill
- Create `src/lib/validations/login.ts`
- Create `src/components/dashboard/LoginForm.tsx`
- Create `src/app/dashboard/(auth)/login/page.tsx`
- Create `src/components/auth/LogoutButton.tsx`
- Create `src/components/dashboard/DashboardNav.tsx`
- Create `src/app/dashboard/(dashboard)/layout.tsx`
- Create `src/app/dashboard/(dashboard)/page.tsx`

### Tess (QA) - `qa-playwright` skill
- E2E tests for login flow
- E2E tests for route protection
- E2E tests for logout flow
- E2E tests for session persistence

### Echo (Code Review) - `fairmind-code-review` skill
- Review all new files for quality, security, patterns

### Shield (Security)
- Validate auth implementation against OWASP
- Review RLS policies
- Check session security

---

## Execution Order

```
1. Backend (Echo) ──────────────────────────────────┐
   - Install deps                                    │
   - Supabase clients (middleware.ts, auth-server.ts)│
   - DB migration                                    │
   - TypeScript types                                │
   - Auth utilities                                  ├── Can run in parallel
   - Server actions                                  │   after backend basics
   - Logout API route                                │
   - Middleware                                      │
                                                     │
2. Frontend (Echo) ─────────────────────────────────┘
   - Login validation schema
   - LoginForm component
   - Login page
   - LogoutButton
   - DashboardNav
   - Dashboard layout
   - Dashboard placeholder

3. QA (Tess) ── After backend + frontend complete
   - Create and run E2E tests

4. Code Review (Echo) ── After QA pass
   - Review all changes

5. Security (Shield) ── After code review
   - Security validation
```

---

## Unresolved Questions

1. **Route groups vs conditional layout**: Should we use `(auth)`/`(dashboard)` route groups or conditional rendering in dashboard layout? Recommended: route groups for clean separation.
2. **Test organizer account**: How should test organizer be created? Via Supabase dashboard manually + SQL insert into organizers table? Or seed script?
3. **Root layout Navigation**: The root `layout.tsx` includes `<Navigation />`. Dashboard routes should NOT show this. Options: use route groups at app level `(public)` vs `(dashboard)`, or hide Navigation conditionally. Simplest: conditionally hide via pathname check in Navigation component.
