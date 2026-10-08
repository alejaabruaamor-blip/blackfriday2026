CREATE TABLE public.visitor_presence (
  session_id text PRIMARY KEY,
  step text NOT NULL,
  utm_campaign text,
  last_seen timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.visitor_presence TO authenticated;
GRANT ALL ON public.visitor_presence TO service_role;
ALTER TABLE public.visitor_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read presence" ON public.visitor_presence FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX visitor_presence_last_seen ON public.visitor_presence (last_seen);