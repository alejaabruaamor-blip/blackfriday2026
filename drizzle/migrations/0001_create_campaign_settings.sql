CREATE TABLE public.campaign_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  meta_campaign_id text,
  last_action text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_settings TO authenticated;
GRANT ALL ON public.campaign_settings TO service_role;

ALTER TABLE public.campaign_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read campaign settings" ON public.campaign_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert campaign settings" ON public.campaign_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update campaign settings" ON public.campaign_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete campaign settings" ON public.campaign_settings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
