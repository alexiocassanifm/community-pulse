-- Add duplicate prevention columns to anonymous_submissions table
-- Supports rate limiting by IP hash and device fingerprinting

-- Step 1: Add columns (nullable first for safe backfill)
ALTER TABLE public.anonymous_submissions
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Backfill existing records
UPDATE public.anonymous_submissions
SET
  ip_hash = 'legacy-' || id::TEXT,
  submitted_at = COALESCE(submission_timestamp, created_at, NOW())
WHERE ip_hash IS NULL;

-- Step 3: Apply NOT NULL constraints after backfill
ALTER TABLE public.anonymous_submissions
  ALTER COLUMN ip_hash SET NOT NULL;

ALTER TABLE public.anonymous_submissions
  ALTER COLUMN submitted_at SET NOT NULL;

-- Step 4: Create performance indexes

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

-- Step 5: Add column comments
COMMENT ON COLUMN public.anonymous_submissions.ip_hash IS 'SHA256 hash of submitter IP address for rate limiting';
COMMENT ON COLUMN public.anonymous_submissions.device_id IS 'Anonymous client-generated device identifier (format: timestamp-random)';
COMMENT ON COLUMN public.anonymous_submissions.submitted_at IS 'Precise submission timestamp for rate limiting calculations';

-- Step 6: Create data retention cleanup function
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
