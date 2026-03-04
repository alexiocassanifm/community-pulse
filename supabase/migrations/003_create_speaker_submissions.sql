-- Speaker submissions table
CREATE TABLE IF NOT EXISTS public.speaker_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  talk_title TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('speech', 'demo', 'workshop')),
  ai_tools_experience TEXT NOT NULL,
  title_company TEXT,
  anything_else TEXT,
  assigned_meetup TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  access_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  token_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_speaker_submissions_email ON public.speaker_submissions(email);
CREATE INDEX idx_speaker_submissions_status ON public.speaker_submissions(status);
CREATE INDEX idx_speaker_submissions_access_token ON public.speaker_submissions(access_token);
CREATE INDEX idx_speaker_submissions_created_at ON public.speaker_submissions(created_at DESC);

-- Reuse existing updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_speaker_submissions ON public.speaker_submissions;
CREATE TRIGGER set_updated_at_speaker_submissions
  BEFORE UPDATE ON public.speaker_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Speaker messages table
CREATE TABLE IF NOT EXISTS public.speaker_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.speaker_submissions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'speaker')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_speaker_messages_submission ON public.speaker_messages(submission_id, created_at);

-- Speaker status history table
CREATE TABLE IF NOT EXISTS public.speaker_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.speaker_submissions(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_speaker_status_history_submission ON public.speaker_status_history(submission_id, created_at);

-- Enable RLS
ALTER TABLE public.speaker_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_status_history ENABLE ROW LEVEL SECURITY;

-- RLS: speaker_submissions
CREATE POLICY "speaker_submissions_anon_insert"
  ON public.speaker_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "speaker_submissions_organizers_select"
  ON public.speaker_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

CREATE POLICY "speaker_submissions_organizers_update"
  ON public.speaker_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

CREATE POLICY "speaker_submissions_service_role_all"
  ON public.speaker_submissions FOR ALL
  TO service_role
  USING (true);

-- RLS: speaker_messages
CREATE POLICY "speaker_messages_organizers_select"
  ON public.speaker_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

CREATE POLICY "speaker_messages_organizers_insert"
  ON public.speaker_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

CREATE POLICY "speaker_messages_service_role_all"
  ON public.speaker_messages FOR ALL
  TO service_role
  USING (true);

-- RLS: speaker_status_history
CREATE POLICY "speaker_status_history_organizers_select"
  ON public.speaker_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

CREATE POLICY "speaker_status_history_service_role_all"
  ON public.speaker_status_history FOR ALL
  TO service_role
  USING (true);
