-- Generic site settings key-value store
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Reuse existing updated_at trigger function from migration 001
DROP TRIGGER IF EXISTS set_updated_at_site_settings ON public.site_settings;
CREATE TRIGGER set_updated_at_site_settings
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read settings
CREATE POLICY "site_settings_public_read"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS: Authenticated organizers can update settings
CREATE POLICY "site_settings_organizer_update"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.organizers WHERE organizers.id = auth.uid())
  );

-- RLS: Service role has full access
CREATE POLICY "site_settings_service_role_all"
  ON public.site_settings FOR ALL
  TO service_role
  USING (true);

-- Seed community_link setting
INSERT INTO public.site_settings (key, value)
VALUES (
  'community_link',
  '{"enabled": false, "platform": "telegram", "url": "", "label": ""}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
