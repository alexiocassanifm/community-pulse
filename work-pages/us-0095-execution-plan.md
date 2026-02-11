# Execution Plan: US-2026-0095 - Duplicate Submission Prevention System

**User Story**: US-2026-0095
**Date**: 2026-02-08
**Created By**: Atlas (Tech Lead)

## Current Architecture Overview

### Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) with RLS policies
- **Form**: React Hook Form + Zod validation
- **Storage**: localStorage for draft persistence (`src/lib/form-persistence.ts`)

### Key Files
| File | Role |
|------|------|
| `src/lib/form-persistence.ts` | LocalStorage draft save/load/clear (pattern to follow) |
| `src/hooks/use-multi-step-form.ts` | Multi-step form logic, submission handler |
| `src/app/api/submit-preferences/route.ts` | POST API endpoint, Supabase insert |
| `src/components/form/anonymous-form-container.tsx` | Form container, renders steps |
| `src/types/database.types.ts` | TypeScript types for Supabase schema |
| `src/types/form.ts` | Form section definitions, step states |
| `src/lib/supabase/client.ts` | Supabase client (anon key) |
| `supabase/migrations/001_create_anonymous_submissions.sql` | Initial DB schema |

### Existing Patterns
- SSR safety: `typeof window === "undefined"` guard
- Error handling: try-catch with `console.error`, return boolean success
- Storage keys: descriptive kebab-case (`anonymous-form-draft`)
- Supabase: anon role INSERT only, service_role for SELECT/DELETE
- RLS: enabled with role-specific policies

---

## Task Breakdown & Dependencies

```
TASK-0071 (client storage) ──┐
                              ├──> TASK-0080 (integration)
TASK-0079 (DB migration)   ──┘
```

- TASK-0071 and TASK-0079 can run in PARALLEL (no interdependency)
- TASK-0080 depends on BOTH completing first

---

## TASK-0071: Client-Side Submission Storage Service

**Agent**: Echo (Software Engineer)
**Skill**: `frontend-react-nextjs`
**File to create**: `src/lib/submission-storage.ts`

### What to Build

A localStorage + cookie service for tracking form submissions, following the exact pattern of `src/lib/form-persistence.ts`.

### Functions

1. **`checkSubmissionStatus(): SubmissionStatus`**
   - Check localStorage keys: `meetup_form_submitted`, `meetup_device_id`, `meetup_submission_time`
   - Fallback to cookie `meetup_form_submitted` if localStorage missing
   - Return `{ hasSubmitted, deviceId, timestamp? }`

2. **`markAsSubmitted(deviceId: string): boolean`**
   - Set localStorage: `meetup_form_submitted=true`, `meetup_device_id={id}`, `meetup_submission_time={ISO}`
   - Set cookie: `meetup_form_submitted=true; max-age=2592000; path=/; SameSite=Strict`
   - Return success boolean

3. **`generateDeviceId(): string`**
   - Return existing from localStorage if present
   - Generate: `{Date.now()}-{random9chars}` (e.g. `1704067200000-x7k9m2p`)
   - Store in localStorage, return

### Type Definition
```typescript
interface SubmissionStatus {
  hasSubmitted: boolean;
  deviceId: string;
  timestamp?: string;
}
```

### Key Requirements
- SSR-safe (`typeof window === "undefined"` checks)
- try-catch every storage operation
- No PII stored
- Cookie: 30-day expiry, SameSite=Strict, NOT HttpOnly (needs JS access)
- Follow `form-persistence.ts` code style exactly

---

## TASK-0079: Database Schema Migration

**Agent**: Echo (Software Engineer)
**Skill**: `backend-nextjs`
**File to create**: `supabase/migrations/002_add_duplicate_prevention.sql`

### Schema Changes

Add to `anonymous_submissions` table:

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| `ip_hash` | TEXT | NOT NULL | none | SHA256 hash of IP |
| `device_id` | TEXT | NULL | none | Anonymous device ID |
| `submitted_at` | TIMESTAMPTZ | NOT NULL | NOW() | Rate limiting timestamp |

### Indexes
1. `idx_ip_hash_time` - Composite on `(ip_hash, submitted_at)` for rate limit queries
2. `idx_device_id` - On `device_id` WHERE NOT NULL (partial index)
3. `idx_submitted_at` - On `submitted_at DESC` for cleanup/reporting

### Migration Strategy
1. Add columns as NULLABLE first
2. Backfill existing rows: `ip_hash = 'legacy-' || id`, `submitted_at = COALESCE(submission_timestamp, created_at, NOW())`
3. Apply NOT NULL constraint on `ip_hash` after backfill
4. Create indexes
5. Create cleanup function for data retention

### TypeScript Types Update
Update `src/types/database.types.ts`:
- Add `ip_hash`, `device_id`, `submitted_at` to Row, Insert, and Update types

---

## TASK-0080: Integration (Depends on 0071 + 0079)

**Agent**: Echo (Software Engineer)
**Skill**: `frontend-react-nextjs`

### Changes Required

#### 1. `src/hooks/use-multi-step-form.ts`
- Import `checkSubmissionStatus`, `markAsSubmitted`, `generateDeviceId`
- Add state: `hasAlreadySubmitted`, `submissionTimestamp`
- `useEffect` on mount: check submission status, set state
- In `handleFormSubmit`:
  - Pre-check: if already submitted, abort
  - Add `device_id` to POST body
  - Handle 429 response: mark as submitted, show message
  - On success: call `markAsSubmitted(deviceId)`
- Export new state: `hasAlreadySubmitted`, `submissionTimestamp`

#### 2. `src/app/api/submit-preferences/route.ts`
- Import `crypto` from Node.js
- Add `hashIP(ip: string): string` helper (SHA256)
- Extract IP: `x-forwarded-for` (first entry) or `x-real-ip` or `'unknown'`
- Before insert: query Supabase for `ip_hash` match within 24h
- If found: return 429 with message
- Add `ip_hash`, `device_id`, `submitted_at` to insert data
- Need service_role client for SELECT query (anon can only INSERT)

#### 3. `src/components/form/anonymous-form-container.tsx`
- Import `AlreadySubmittedMessage`
- Read `hasAlreadySubmitted`, `submissionTimestamp` from hook
- If submitted: render `AlreadySubmittedMessage` instead of form

#### 4. `src/components/form/already-submitted-message.tsx` (NEW)
- Card with CheckCircle icon, thank you message
- Show submission timestamp if available
- Contact link for updates
- Match existing component styling (Shadcn Card, Dialog patterns)

#### 5. `src/lib/supabase/client.ts` (or new file)
- May need a service-role Supabase client for server-side SELECT queries
- The existing client uses anon key (INSERT only, no SELECT per RLS)
- Create `src/lib/supabase/server.ts` with `SUPABASE_SERVICE_ROLE_KEY` env var

---

## Execution Order

1. **Phase 1** (Parallel):
   - Echo "frontend-dev": TASK-0071 (submission-storage.ts)
   - Echo "backend-dev": TASK-0079 (migration SQL + TypeScript types)

2. **Phase 2** (Sequential, after Phase 1):
   - Echo "integrator": TASK-0080 (hook + API + container + AlreadySubmitted component)

3. **Phase 3** (Validation):
   - Code review of all changes
   - Final sanity check

---

## Unresolved Questions

None - all requirements are clear from FairMind task definitions.
