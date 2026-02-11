# Work Package: Echo (Software Engineer) - Database Schema Migration for Duplicate Prevention

**Task ID**: TASK-2026-0079
**Date Created**: 2026-02-08
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `backend-nextjs`

## Task Overview

Create the SQL migration `supabase/migrations/002_add_duplicate_prevention.sql` to add duplicate prevention columns to the `anonymous_submissions` table, and update TypeScript types in `src/types/database.types.ts`.

## Reference: Existing Schema

The table `anonymous_submissions` is defined in `supabase/migrations/001_create_anonymous_submissions.sql`. Key facts:
- UUID primary key with `gen_random_uuid()`
- Has `submission_timestamp`, `created_at`, `updated_at` columns
- RLS enabled: anon can INSERT only, service_role can SELECT/DELETE
- Has existing indexes on `submission_timestamp`, `experience_level`, `industry`, `predefined_topics`
- Has `update_updated_at()` trigger function

## Execution Plan

### Step 1: Create migration file

File: `supabase/migrations/002_add_duplicate_prevention.sql`

### Step 2: Add new columns (NULLABLE first for backfill)

```sql
ALTER TABLE public.anonymous_submissions
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();
```

### Step 3: Backfill existing records

```sql
UPDATE public.anonymous_submissions
SET
  ip_hash = 'legacy-' || id::TEXT,
  submitted_at = COALESCE(submission_timestamp, created_at, NOW())
WHERE ip_hash IS NULL;
```

### Step 4: Apply NOT NULL constraint on ip_hash

```sql
ALTER TABLE public.anonymous_submissions
  ALTER COLUMN ip_hash SET NOT NULL;

ALTER TABLE public.anonymous_submissions
  ALTER COLUMN submitted_at SET NOT NULL;
```

### Step 5: Create performance indexes

```sql
-- Composite index for rate limiting queries: WHERE ip_hash = ? AND submitted_at >= ?
CREATE INDEX IF NOT EXISTS idx_ip_hash_submitted_at
  ON public.anonymous_submissions(ip_hash, submitted_at);

-- Partial index on device_id (only non-null values)
CREATE INDEX IF NOT EXISTS idx_device_id
  ON public.anonymous_submissions(device_id)
  WHERE device_id IS NOT NULL;

-- Descending index for cleanup/reporting queries
CREATE INDEX IF NOT EXISTS idx_submitted_at_desc
  ON public.anonymous_submissions(submitted_at DESC);
```

### Step 6: Add column comments

```sql
COMMENT ON COLUMN public.anonymous_submissions.ip_hash IS 'SHA256 hash of submitter IP address for rate limiting';
COMMENT ON COLUMN public.anonymous_submissions.device_id IS 'Anonymous client-generated device identifier (format: timestamp-random)';
COMMENT ON COLUMN public.anonymous_submissions.submitted_at IS 'Precise submission timestamp for rate limiting calculations';
```

### Step 7: Create data retention cleanup function

```sql
CREATE OR REPLACE FUNCTION cleanup_old_ip_hashes(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE public.anonymous_submissions
  SET ip_hash = 'expired-' || id::TEXT,
      device_id = NULL
  WHERE submitted_at < NOW() - (retention_days || ' days')::INTERVAL
    AND ip_hash NOT LIKE 'expired-%'
    AND ip_hash NOT LIKE 'legacy-%';
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 8: Update TypeScript types

File: `src/types/database.types.ts`

Add to `Row` type:
```typescript
ip_hash: string;
device_id: string | null;
submitted_at: string;
```

Add to `Insert` type:
```typescript
ip_hash: string;       // Required for new inserts
device_id?: string | null;
submitted_at?: string;  // Defaults to NOW() in DB
```

Add to `Update` type:
```typescript
ip_hash?: string;
device_id?: string | null;
submitted_at?: string;
```

## Files to Create/Modify

1. **CREATE**: `supabase/migrations/002_add_duplicate_prevention.sql`
2. **MODIFY**: `src/types/database.types.ts` (add 3 columns to Row, Insert, Update)

## Acceptance Criteria

- [ ] Migration file `002_add_duplicate_prevention.sql` created
- [ ] `ip_hash` column: TEXT, NOT NULL (after backfill)
- [ ] `device_id` column: TEXT, NULLABLE
- [ ] `submitted_at` column: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- [ ] Composite index on `(ip_hash, submitted_at)` created
- [ ] Partial index on `device_id` (WHERE NOT NULL)
- [ ] Descending index on `submitted_at`
- [ ] Existing records backfilled with `'legacy-' || id` for ip_hash
- [ ] Existing records backfilled with existing timestamp for submitted_at
- [ ] Column comments added
- [ ] Cleanup function `cleanup_old_ip_hashes()` created
- [ ] TypeScript types updated in `database.types.ts`
- [ ] Migration follows SQL style of existing `001_*.sql` file

## Dependencies

- Depends on existing `001_create_anonymous_submissions.sql` schema
- No external packages needed

## Expected Deliverables

1. `supabase/migrations/002_add_duplicate_prevention.sql`
2. Updated `src/types/database.types.ts`

## Journal Requirements

Maintain journal at: `fairmind/journals/TASK-0079_echo_journal.md`
Update after each significant action or decision.
