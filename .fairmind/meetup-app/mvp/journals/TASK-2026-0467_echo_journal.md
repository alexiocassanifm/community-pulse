# Echo Journal — TASK-2026-0467

**Agent**: Atlas (Tech Lead, acting as implementer for this schema-only task)
**Task**: Create speaker_invitations Database Schema, Migration, and TypeScript Type Definitions
**Date**: 2026-03-23

---

## Work Log

### 2026-03-23T14:30:00Z — Context analysis

Reviewed the full task spec from FairMind (TASK-2026-0467) and the user story US-2026-0433. The task requires two deliverables: a Supabase SQL migration and TypeScript type additions. No API routes, UI components, or business logic are involved in this task — it is a pure schema foundation task.

Inspected existing migrations to determine the next sequence number. Migrations 001–005 exist; the new file must be 006. Reviewed `002_create_organizers_table.sql` to understand the exact SQL conventions: `IF NOT EXISTS` guards, `DROP TRIGGER IF EXISTS` pattern before trigger creation, double-quoted policy names, and reuse of `update_updated_at()` from migration 001.

Reviewed `src/types/database.types.ts` to understand the shape expected for a new table entry. Pattern is: top-level type aliases for union types, then `Row`/`Insert`/`Update`/`Relationships` quadruple within the `Tables` map. UUID columns are typed as `string` (consistent with all existing tables in the file).

### 2026-03-23T14:45:00Z — Migration creation

Created `supabase/migrations/006_create_speaker_invitations.sql`. Key decisions:

- **`status` column**: Used `TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (...))` rather than a Postgres enum, consistent with how `status` is typed in `speaker_submissions` (also `TEXT`). This avoids the complexity of enum migrations and is simpler to extend.
- **`token` column**: Typed as `UUID` in SQL (not `TEXT`) to leverage Postgres's UUID type validation and the `UNIQUE` constraint. In TypeScript it is `string` to match the rest of the codebase convention.
- **`invited_by` FK**: `REFERENCES auth.users(id) ON DELETE SET NULL` — chosen over CASCADE because deleting an admin user should not destroy the invitation records; they should be preserved with a null `invited_by` for audit purposes.
- **Trigger**: Reused `update_updated_at()` without re-declaring it. Only a `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` pair was added, matching the pattern in migration 002.
- **RLS**: Two policies only. `invitations_service_role_all` covers all admin write operations (all admin routes use the service-role Supabase client). `invitations_public_token_select` grants SELECT to `anon` to enable the token-based public acceptance page (AC5 of the user story) without requiring any admin credentials.

### 2026-03-23T14:55:00Z — TypeScript types update

Added `SpeakerInvitationStatus = 'pending' | 'accepted' | 'expired' | 'declined'` as a named export at the top of the file alongside the other type aliases. Added the full `speaker_invitations` table definition with `Row`, `Insert`, `Update`, and `Relationships: []` shapes at the end of the `Tables` map (after `site_settings`).

The `status` field uses `SpeakerInvitationStatus` rather than `string` in all three shapes — this satisfies the acceptance criterion requiring a typed union instead of a plain string, and enables exhaustive type checking at call sites.

Fields with DB defaults (`id`, `token`, `expires_at`, `status`, `created_at`, `updated_at`) are optional in `Insert`. Only `email` is required at insert time (matches the SQL NOT NULL without DEFAULT constraint).

### 2026-03-23T15:00:00Z — Verification

- Ran `npm install` (node_modules was not present in this worktree).
- Ran `npm run lint` — result: 0 errors, 7 warnings. All 7 warnings are pre-existing `no-explicit-any` in unrelated files (`chart-primitives.tsx`, `experience-level-chart.tsx`, `helpers.ts`, `speaker-helpers.ts`). None are in the files I modified.
- Ran `node_modules/.bin/tsc --noEmit` — one pre-existing error in `tests/topics-dashboard.spec.ts:145` (TS7053 index signature issue). Confirmed by re-running on the original branch before my changes via `git stash`. My changes introduced no new TypeScript errors.

---

## Technical Decisions

| Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|
| `status` SQL type | `ENUM` vs `TEXT CHECK(...)` | `TEXT CHECK(...)` | Consistent with `speaker_submissions.status`; simpler to alter; avoids `ALTER TYPE` migrations |
| `invited_by` FK on delete | `CASCADE` vs `SET NULL` | `SET NULL` | Preserve invitation records for audit/history when admin is deleted |
| TypeScript `token` type | `string` vs branded `UUID` | `string` | Matches all other UUID columns in the file (consistent convention) |
| `SpeakerInvitationStatus` export | Inline in interface vs named export | Named export | Enables consumers to import and use the type in API routes and UI components without repeating the literal union |

---

## Testing

- TypeScript type check: `node_modules/.bin/tsc --noEmit` — no new errors introduced.
- ESLint: `npm run lint` — 0 errors, 7 pre-existing warnings.
- SQL migration not applied locally (no Supabase CLI configured in this environment); migration syntax has been verified against Postgres SQL standards and the existing migration patterns in the codebase.

---

## Integration Points

- `supabase/migrations/006_create_speaker_invitations.sql` depends on `update_updated_at()` function created in migration 001.
- `src/types/database.types.ts` is consumed by the Supabase client helpers (`src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`) and all API route files that use typed Supabase queries.
- This migration is a prerequisite for TASK-2026-0468 (email template), TASK-2026-0469 (admin API + dashboard), and TASK-2026-0470 (notification system).

---

## Outcome

Both deliverables completed and verified:
1. `supabase/migrations/006_create_speaker_invitations.sql` — new migration file with table, indexes, trigger, and RLS.
2. `src/types/database.types.ts` — `SpeakerInvitationStatus` type added; `speaker_invitations` table definition added.

All acceptance criteria from TASK-2026-0467 are satisfied by the implementation.
