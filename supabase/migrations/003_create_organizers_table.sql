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
