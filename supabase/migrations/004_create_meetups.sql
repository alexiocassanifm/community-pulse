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

-- Indexes
CREATE INDEX idx_meetups_status ON public.meetups(status);
CREATE INDEX idx_meetups_date ON public.meetups(date DESC);

-- Reuse existing updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_meetups ON public.meetups;
CREATE TRIGGER set_updated_at_meetups
  BEFORE UPDATE ON public.meetups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;

-- RLS: anon can read published meetups (for homepage + speaker form)
CREATE POLICY "meetups_anon_select_published"
  ON public.meetups FOR SELECT
  TO anon
  USING (status = 'published');

-- RLS: organizers full access
CREATE POLICY "meetups_organizers_all"
  ON public.meetups FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

-- RLS: service role full access
CREATE POLICY "meetups_service_role_all"
  ON public.meetups FOR ALL
  TO service_role
  USING (true);

-- Add preferred_meetup FK to speaker_submissions
ALTER TABLE public.speaker_submissions
  ADD COLUMN preferred_meetup UUID REFERENCES public.meetups(id) ON DELETE SET NULL;

-- Migrate assigned_meetup from TEXT to UUID FK
ALTER TABLE public.speaker_submissions
  DROP COLUMN assigned_meetup;

ALTER TABLE public.speaker_submissions
  ADD COLUMN assigned_meetup UUID REFERENCES public.meetups(id) ON DELETE SET NULL;
