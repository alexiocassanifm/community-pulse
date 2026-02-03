-- Create anonymous_submissions table
CREATE TABLE IF NOT EXISTS public.anonymous_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Professional Background
  professional_role TEXT,
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead', 'executive', NULL)),
  industry TEXT,
  skills TEXT[],

  -- Availability
  preferred_days TEXT[],
  preferred_times TEXT[] CHECK (preferred_times <@ ARRAY['morning', 'afternoon', 'evening', 'flexible']::TEXT[]),
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', NULL)),

  -- Event Formats
  format_presentations BOOLEAN DEFAULT false,
  format_workshops BOOLEAN DEFAULT false,
  format_discussions BOOLEAN DEFAULT false,
  format_networking BOOLEAN DEFAULT false,
  format_hackathons BOOLEAN DEFAULT false,
  format_mentoring BOOLEAN DEFAULT false,
  format_hybrid TEXT CHECK (format_hybrid IN ('in_person', 'virtual', 'hybrid', 'no_preference', NULL)),
  format_custom TEXT,

  -- Topics
  predefined_topics TEXT[],
  custom_topics TEXT,

  -- Metadata
  submission_timestamp TIMESTAMPTZ DEFAULT NOW(),
  form_version TEXT DEFAULT '1.0',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  anonymous_reference_id TEXT UNIQUE,

  -- GDPR
  data_retention_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_timestamp ON public.anonymous_submissions(submission_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_experience ON public.anonymous_submissions(experience_level);
CREATE INDEX IF NOT EXISTS idx_submissions_industry ON public.anonymous_submissions(industry);
CREATE INDEX IF NOT EXISTS idx_submissions_topics ON public.anonymous_submissions USING GIN(predefined_topics);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.anonymous_submissions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.anonymous_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.anonymous_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_anonymous_insert" ON public.anonymous_submissions;
DROP POLICY IF EXISTS "prevent_anonymous_read" ON public.anonymous_submissions;
DROP POLICY IF EXISTS "service_role_read_all" ON public.anonymous_submissions;
DROP POLICY IF EXISTS "prevent_anonymous_update" ON public.anonymous_submissions;
DROP POLICY IF EXISTS "prevent_anonymous_delete" ON public.anonymous_submissions;
DROP POLICY IF EXISTS "service_role_delete" ON public.anonymous_submissions;

-- RLS Policy: Allow anonymous inserts
CREATE POLICY "allow_anonymous_insert" ON public.anonymous_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- RLS Policy: Prevent anonymous reads
CREATE POLICY "prevent_anonymous_read" ON public.anonymous_submissions
  FOR SELECT TO anon USING (false);

-- RLS Policy: Service role can read all
CREATE POLICY "service_role_read_all" ON public.anonymous_submissions
  FOR SELECT TO service_role USING (true);

-- RLS Policy: Prevent updates from anon
CREATE POLICY "prevent_anonymous_update" ON public.anonymous_submissions
  FOR UPDATE TO anon USING (false);

-- RLS Policy: Prevent deletes from anon
CREATE POLICY "prevent_anonymous_delete" ON public.anonymous_submissions
  FOR DELETE TO anon USING (false);

-- RLS Policy: Service role can delete (for GDPR compliance)
CREATE POLICY "service_role_delete" ON public.anonymous_submissions
  FOR DELETE TO service_role USING (true);
