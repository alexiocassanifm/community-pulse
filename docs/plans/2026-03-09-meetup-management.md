# Meetup Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add meetup CRUD to dashboard, speaker-meetup assignment, speaker preference, and homepage upcoming meetups section.

**Architecture:** New `meetups` table with RLS. CRUD API routes behind organizer auth. Dashboard list page with create/edit dialog. Speaker detail gets meetup dropdown. Homepage gets server-fetched upcoming meetups section.

**Tech Stack:** Next.js 14 App Router, Supabase (Postgres + RLS), shadcn/ui, Zod, Tailwind CSS, lucide-react

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/004_create_meetups.sql`

**Step 1: Write migration**

```sql
-- Meetups table
CREATE TABLE IF NOT EXISTS public.meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  luma_url TEXT,
  homepage_visible BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'past')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetups_status ON public.meetups(status);
CREATE INDEX idx_meetups_date ON public.meetups(date DESC);

DROP TRIGGER IF EXISTS set_updated_at_meetups ON public.meetups;
CREATE TRIGGER set_updated_at_meetups
  BEFORE UPDATE ON public.meetups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetups_anon_select_published"
  ON public.meetups FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "meetups_organizers_all"
  ON public.meetups FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

CREATE POLICY "meetups_service_role_all"
  ON public.meetups FOR ALL
  TO service_role
  USING (true);

-- Add preferred_meetup to speaker_submissions
ALTER TABLE public.speaker_submissions
  ADD COLUMN preferred_meetup UUID REFERENCES public.meetups(id) ON DELETE SET NULL;

-- Migrate assigned_meetup from TEXT to UUID FK
ALTER TABLE public.speaker_submissions
  DROP COLUMN assigned_meetup;

ALTER TABLE public.speaker_submissions
  ADD COLUMN assigned_meetup UUID REFERENCES public.meetups(id) ON DELETE SET NULL;
```

**Step 2: Commit**

```bash
git add supabase/migrations/004_create_meetups.sql
git commit -m "feat: add meetups table and speaker_submissions FK columns"
```

---

### Task 2: Meetup Types & Zod Schemas

**Files:**
- Create: `src/types/meetup.ts`
- Modify: `src/types/speaker.ts`
- Create: `src/lib/validations/meetup-schema.ts`
- Modify: `src/lib/validations/speaker-schema.ts`

**Step 1: Create meetup types**

`src/types/meetup.ts`:
```typescript
export type MeetupStatus = "draft" | "published" | "past";

export interface MeetupRow {
  id: string;
  title: string;
  date: string;
  location: string;
  luma_url: string | null;
  homepage_visible: boolean;
  status: MeetupStatus;
  created_at: string;
  updated_at: string;
}
```

**Step 2: Update speaker types**

Add `preferred_meetup: string | null;` to `SpeakerSubmissionRow` (after `assigned_meetup`).

Add `preferred_meetup?: string | null;` to `SpeakerSubmissionInsert`.

**Step 3: Create meetup Zod schemas**

`src/lib/validations/meetup-schema.ts`:
```typescript
import { z } from "zod";

export const createMeetupSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required").max(500),
  luma_url: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
  homepage_visible: z.boolean().optional(),
  status: z.enum(["draft", "published", "past"]).optional(),
});

export const updateMeetupSchema = createMeetupSchema.partial();

export const assignMeetupSchema = z.object({
  meetup_id: z.string().uuid("Invalid meetup ID").nullable(),
});

export type CreateMeetupData = z.infer<typeof createMeetupSchema>;
export type UpdateMeetupData = z.infer<typeof updateMeetupSchema>;
```

**Step 4: Update speaker-schema.ts**

Add `preferred_meetup` to `speakerSubmissionSchema`:
```typescript
preferred_meetup: z.string().uuid().optional().or(z.literal("")),
```

**Step 5: Commit**

```bash
git add src/types/meetup.ts src/types/speaker.ts src/lib/validations/meetup-schema.ts src/lib/validations/speaker-schema.ts
git commit -m "feat: add meetup types and Zod schemas"
```

---

### Task 3: Meetup API — Create & List

**Files:**
- Create: `src/app/api/meetups/route.ts`

**Step 1: Implement POST + GET**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { createMeetupSchema } from "@/lib/validations/meetup-schema";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createMeetupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid data", 400);
    }

    const { data: meetup, error } = await auth.supabase
      .from("meetups")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      console.error("Create meetup error:", error);
      return jsonError("Failed to create meetup", 500);
    }

    return NextResponse.json(meetup, { status: 201 });
  } catch (err) {
    return handleRouteError("POST /api/meetups", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Try organizer auth first
    const auth = await requireAuth();
    const isOrganizer = !(auth instanceof NextResponse);

    const supabase = isOrganizer ? auth.supabase : createServerClient();

    let query = supabase.from("meetups").select("*").order("date", { ascending: true });

    if (!isOrganizer) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      console.error("List meetups error:", error);
      return jsonError("Failed to list meetups", 500);
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    return handleRouteError("GET /api/meetups", err);
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/meetups/route.ts
git commit -m "feat: add meetup create and list API routes"
```

---

### Task 4: Meetup API — Update & Delete

**Files:**
- Create: `src/app/api/meetups/[id]/route.ts`

**Step 1: Implement PATCH + DELETE**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { updateMeetupSchema } from "@/lib/validations/meetup-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await req.json();
    const parsed = updateMeetupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid data", 400);
    }

    const { data: meetup, error } = await auth.supabase
      .from("meetups")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update meetup error:", error);
      return jsonError("Failed to update meetup", 500);
    }

    return NextResponse.json(meetup);
  } catch (err) {
    return handleRouteError("PATCH /api/meetups/[id]", err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    // Block delete if speakers assigned
    const { count } = await auth.supabase
      .from("speaker_submissions")
      .select("id", { count: "exact", head: true })
      .eq("assigned_meetup", id);

    if (count && count > 0) {
      return jsonError("Cannot delete meetup with assigned speakers", 409);
    }

    const { error } = await auth.supabase
      .from("meetups")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete meetup error:", error);
      return jsonError("Failed to delete meetup", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError("DELETE /api/meetups/[id]", err);
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/meetups/\[id\]/route.ts
git commit -m "feat: add meetup update and delete API routes"
```

---

### Task 5: Speaker API — Assign Meetup

**Files:**
- Create: `src/app/api/speakers/admin/[id]/assign-meetup/route.ts`

**Step 1: Implement PATCH**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { assignMeetupSchema } from "@/lib/validations/meetup-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await req.json();
    const parsed = assignMeetupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid data", 400);
    }

    // Verify speaker is accepted
    const { data: speaker } = await auth.supabase
      .from("speaker_submissions")
      .select("status")
      .eq("id", id)
      .single();

    if (!speaker || speaker.status !== "accepted") {
      return jsonError("Only accepted speakers can be assigned to meetups", 400);
    }

    const { data, error } = await auth.supabase
      .from("speaker_submissions")
      .update({ assigned_meetup: parsed.data.meetup_id })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Assign meetup error:", error);
      return jsonError("Failed to assign meetup", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return handleRouteError("PATCH /api/speakers/admin/[id]/assign-meetup", err);
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/speakers/admin/\[id\]/assign-meetup/route.ts
git commit -m "feat: add speaker meetup assignment API route"
```

---

### Task 6: Speaker Submit API — Preferred Meetup

**Files:**
- Modify: `src/app/api/speakers/submit/route.ts`

**Step 1: Update submit handler**

The `speakerSubmissionSchema` already has `preferred_meetup` from Task 2. The submit route uses `validateZodBody(req, speakerSubmissionSchema)`, so parsed data will include `preferred_meetup`.

In the INSERT object, add `preferred_meetup`:
```typescript
// After existing fields in the insert object:
...(data.preferred_meetup ? { preferred_meetup: data.preferred_meetup } : {}),
```

**Step 2: Commit**

```bash
git add src/app/api/speakers/submit/route.ts
git commit -m "feat: accept preferred_meetup in speaker submission"
```

---

### Task 7: Dashboard Nav — Add Meetups Item

**Files:**
- Modify: `src/components/dashboard/DashboardNav.tsx`

**Step 1: Add nav item**

Add `CalendarDays` to lucide-react imports. Add between Demographics and Speakers:
```typescript
{ href: "/dashboard/meetups", label: "Meetups", icon: CalendarDays },
```

**Step 2: Commit**

```bash
git add src/components/dashboard/DashboardNav.tsx
git commit -m "feat: add Meetups nav item to dashboard"
```

---

### Task 8: Meetups Dashboard Page

**Files:**
- Create: `src/app/dashboard/(dashboard)/meetups/page.tsx`
- Create: `src/app/dashboard/(dashboard)/meetups/meetups-content.tsx`

**Step 1: Create page.tsx**

Follow speakers page pattern:
```typescript
import type { Metadata } from "next";
import { MeetupsContent } from "./meetups-content";

export const metadata: Metadata = { title: "Meetups" };

export default function MeetupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meetups</h1>
        <p className="text-muted-foreground">Manage your meetup events</p>
      </div>
      <MeetupsContent />
    </div>
  );
}
```

**Step 2: Create meetups-content.tsx**

`"use client"` component with:
- State: `meetups`, `loading`, `dialogOpen`, `editingMeetup`
- Fetch from `GET /api/meetups` on mount
- Table: title, date (formatted), location, status Badge, homepage_visible Switch, actions (Edit, Delete)
- "Create Meetup" Button opens dialog
- Status badges: draft=secondary, published=default (green), past=outline
- Homepage toggle calls `PATCH /api/meetups/[id]` with `{ homepage_visible: !current }`
- Delete calls `DELETE /api/meetups/[id]`, shows error toast if 409
- Edit button sets `editingMeetup` and opens dialog

Use shadcn/ui: Table, Badge, Button, Switch, plus the MeetupDialog from Task 9.

**Step 3: Commit**

```bash
git add src/app/dashboard/\(dashboard\)/meetups/
git commit -m "feat: add meetups dashboard list page"
```

---

### Task 9: Meetup Create/Edit Dialog

**Files:**
- Create: `src/components/dashboard/meetup-dialog.tsx`

**Step 1: Implement dialog**

`"use client"` component. Props: `open`, `onOpenChange`, `meetup?` (for edit), `onSuccess` callback.

Uses shadcn Dialog + react-hook-form + Zod (`createMeetupSchema`). Fields:
- title: Input
- date: Input type="datetime-local"
- location: Input
- luma_url: Input (optional)
- status: Select (draft/published/past)
- homepage_visible: Switch

On submit:
- Create: `POST /api/meetups`
- Edit: `PATCH /api/meetups/[id]`
- Call `onSuccess()` to refresh list

**Step 2: Commit**

```bash
git add src/components/dashboard/meetup-dialog.tsx
git commit -m "feat: add meetup create/edit dialog component"
```

---

### Task 10: Speaker Detail — Meetup Assignment Dropdown

**Files:**
- Modify: `src/app/dashboard/(dashboard)/speakers/[id]/speaker-detail-content.tsx`

**Step 1: Add meetup fetch + dropdown**

- Add state: `meetups` (MeetupRow[])
- Fetch published meetups from `GET /api/meetups` on mount
- Replace text Input for meetup assignment (lines ~234-241) with Select dropdown:
  - Options: published meetups (title + formatted date) + "None" option
  - On change: `PATCH /api/speakers/admin/[id]/assign-meetup` with `{ meetup_id }`
- In info section (lines ~173-179): show meetup title instead of raw text. Show `preferred_meetup` title if set.
- Only show assignment dropdown when speaker status is "accepted"

**Step 2: Commit**

```bash
git add src/app/dashboard/\(dashboard\)/speakers/\[id\]/speaker-detail-content.tsx
git commit -m "feat: replace meetup text input with dropdown in speaker detail"
```

---

### Task 11: Speaker Form — Preferred Meetup Dropdown

**Files:**
- Modify: `src/components/speakers/speaker-form.tsx`

**Step 1: Add meetup fetch + optional dropdown**

- Fetch published meetups from `GET /api/meetups` on mount (public endpoint)
- If meetups exist: render FormField `preferred_meetup` as Select with "No preference" default + meetup options (title + date)
- If no meetups: don't render field
- Include `preferred_meetup` in form submission data

**Step 2: Commit**

```bash
git add src/components/speakers/speaker-form.tsx
git commit -m "feat: add preferred meetup dropdown to speaker form"
```

---

### Task 12: Homepage — Upcoming Meetups Section

**Files:**
- Create: `src/components/sections/UpcomingMeetupsSection.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create section component**

Server component. Fetches meetups from Supabase (anon client via `createBrowserClient` or direct fetch from `/api/meetups`).

Better approach: make it a server component that fetches directly:
```typescript
import { createServerClient } from "@/lib/supabase/server";

export async function UpcomingMeetupsSection() {
  const supabase = createServerClient();
  const { data: meetups } = await supabase
    .from("meetups")
    .select("*")
    .eq("status", "published")
    .eq("homepage_visible", true)
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true });

  if (!meetups?.length) return null;

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Upcoming Meetups</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {meetups.map((meetup) => (
            <div key={meetup.id} className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{meetup.title}</h3>
              <p className="text-muted-foreground mt-2">
                {new Date(meetup.date).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
              <p className="text-muted-foreground">{meetup.location}</p>
              {meetup.luma_url && (
                <a
                  href={meetup.luma_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:underline"
                >
                  View on Luma →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add to homepage**

In `src/app/page.tsx`, import and add between `<HeroSection />` and `<WhyShareSection />`:
```typescript
import { UpcomingMeetupsSection } from "@/components/sections/UpcomingMeetupsSection";
// ...
<HeroSection />
<UpcomingMeetupsSection />
<WhyShareSection />
```

**Step 3: Commit**

```bash
git add src/components/sections/UpcomingMeetupsSection.tsx src/app/page.tsx
git commit -m "feat: add upcoming meetups section to homepage"
```

---

### Task 13: Build Verification

**Step 1: Run lint**

```bash
npm run lint
```

Fix any errors.

**Step 2: Run build**

```bash
npm run build
```

Fix any type errors or build failures.

**Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve lint and build issues"
```
