-- Create speaker_invitations table for admin-initiated speaker invitation lifecycle management
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

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_speaker_invitations_email ON public.speaker_invitations(email);
CREATE INDEX IF NOT EXISTS idx_speaker_invitations_token ON public.speaker_invitations(token);
CREATE INDEX IF NOT EXISTS idx_speaker_invitations_status ON public.speaker_invitations(status);
CREATE INDEX IF NOT EXISTS idx_speaker_invitations_expires_at ON public.speaker_invitations(expires_at);

-- Reuse existing updated_at trigger function from migration 001
DROP TRIGGER IF EXISTS set_updated_at_speaker_invitations ON public.speaker_invitations;
CREATE TRIGGER set_updated_at_speaker_invitations
  BEFORE UPDATE ON public.speaker_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.speaker_invitations ENABLE ROW LEVEL SECURITY;

-- RLS: Service role has full access for all admin API operations
CREATE POLICY "invitations_service_role_all"
  ON public.speaker_invitations FOR ALL
  TO service_role
  USING (true);

-- RLS: Anonymous role can SELECT by token to support the public invitation acceptance page
CREATE POLICY "invitations_public_token_select"
  ON public.speaker_invitations FOR SELECT
  TO anon
  USING (token IS NOT NULL);
