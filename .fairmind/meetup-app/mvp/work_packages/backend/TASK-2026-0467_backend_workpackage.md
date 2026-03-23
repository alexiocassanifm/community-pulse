# Work Package: Backend - Create speaker_invitations Database Schema, Migration, and TypeScript Type Definitions

**Task ID**: TASK-2026-0467
**Date Created**: 2026-03-23
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `backend-nextjs`

---

## Task Overview

Create the `speaker_invitations` database table as a Supabase SQL migration with full RLS policies and performance indexes, then add the corresponding TypeScript type definitions to `src/types/database.types.ts`. This is the foundational database layer that blocks all other speaker invitation tasks (TASK-2026-0468, 0469, 0470).

---

## Execution Plan

### Step 1 — Determine the next migration file number
The `supabase/migrations/` directory contains migrations up to `005_create_site_settings.sql`. The new file must be named `006_create_speaker_invitations.sql`.

### Step 2 — Create the SQL migration file

**File**: `supabase/migrations/006_create_speaker_invitations.sql`

Follow exactly the same SQL conventions used in `002_create_organizers_table.sql`:
- `IF NOT EXISTS` guards on table creation
- `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
- Reuse the existing `update_updated_at()` function (defined in migration 001, do NOT redefine it)
- Named policies using double-quoted strings

**Table definition** — all columns exactly as specified:
```sql
CREATE TABLE IF NOT EXISTS public.speaker_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  event_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'declined')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  personal_message TEXT,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes** (four, named exactly as below):
- `idx_speaker_invitations_email` on `(email)`
- `idx_speaker_invitations_token` on `(token)`
- `idx_speaker_invitations_status` on `(status)`
- `idx_speaker_invitations_expires_at` on `(expires_at)`

**Trigger** — reuse `update_updated_at()`, name the trigger `set_updated_at_speaker_invitations`:
```sql
DROP TRIGGER IF EXISTS set_updated_at_speaker_invitations ON public.speaker_invitations;
CREATE TRIGGER set_updated_at_speaker_invitations
  BEFORE UPDATE ON public.speaker_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**RLS**:
1. `ALTER TABLE public.speaker_invitations ENABLE ROW LEVEL SECURITY;`
2. Policy `invitations_service_role_all` — ALL to `service_role` with `USING (true)`
3. Policy `invitations_public_token_select` — SELECT to `anon` with `USING (token IS NOT NULL)`

### Step 3 — Update TypeScript type definitions

**File**: `src/types/database.types.ts`

Add the `speaker_invitations` entry inside `Database.public.Tables`, after the `site_settings` table definition (before the closing `};` of `Tables`).

Define a `SpeakerInvitationStatus` type alias at the top of the file alongside the other type aliases:
```typescript
export type SpeakerInvitationStatus = 'pending' | 'accepted' | 'expired' | 'declined';
```

Then add the table definition:
```typescript
speaker_invitations: {
  Row: {
    id: string;
    email: string;
    token: string;
    event_id: string | null;
    status: SpeakerInvitationStatus;
    expires_at: string;
    personal_message: string | null;
    invited_by: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    email: string;
    token?: string;
    event_id?: string | null;
    status?: SpeakerInvitationStatus;
    expires_at?: string;
    personal_message?: string | null;
    invited_by?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    email?: string;
    token?: string;
    event_id?: string | null;
    status?: SpeakerInvitationStatus;
    expires_at?: string;
    personal_message?: string | null;
    invited_by?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [];
};
```

**Note**: UUID columns are typed as `string` in TypeScript (consistent with how `id`, `access_token`, etc. are typed in the rest of the file, e.g. `speaker_submissions`).

### Step 4 — Verify TypeScript compilation
Run `npm run lint` to confirm no TypeScript errors were introduced.

---

## Architectural Constraints

- Do NOT redefine `update_updated_at()` — it already exists in migration 001. Only create the trigger.
- Follow the `IF NOT EXISTS` guard pattern for the table and all indexes (matches all other migrations in this project).
- RLS must allow `anon` SELECT by token (required by the public acceptance page described in AC5 of the user story).
- All admin operations go through the `service_role` client — so only `service_role` gets write access via RLS.

---

## Dependencies

- Other agents: None — this task is self-contained and is a prerequisite for all other invitation tasks.
- External systems: Supabase (existing local dev environment).

---

## Acceptance Criteria

All items from the task must be satisfied:

- The migration file applies cleanly without errors.
- `speaker_invitations` table has all specified columns and constraints.
- `status` column rejects values outside `('pending','accepted','expired','declined')`.
- `token` column has a `UNIQUE` constraint.
- `expires_at` defaults to 7 days in the future when not specified.
- `updated_at` is auto-updated by the trigger on any row update.
- RLS is enabled: unauthenticated requests cannot INSERT, UPDATE, or DELETE rows.
- `anon` role can SELECT a row by token.
- `service_role` can perform all CRUD operations.
- `database.types.ts` exports `speaker_invitations` Row/Insert/Update shapes.
- `status` is typed as `'pending' | 'accepted' | 'expired' | 'declined'` union, not plain `string`.
- No TypeScript compilation errors.

---

## Validation Requirements

- `npm run lint` must pass with no errors.
- Manual verification: inspect that the migration file follows the conventions of `002_create_organizers_table.sql`.
- Manual verification: the TypeScript types match the SQL schema exactly (same columns, same nullability).

---

## Expected Deliverables

1. `supabase/migrations/006_create_speaker_invitations.sql` — new file
2. `src/types/database.types.ts` — modified to add `SpeakerInvitationStatus` type and `speaker_invitations` table definition

---

## Journal Requirements

Maintain journal at: `.fairmind/meetup-app/mvp/journals/TASK-2026-0467_echo_journal.md`
Update after each significant action or decision.
