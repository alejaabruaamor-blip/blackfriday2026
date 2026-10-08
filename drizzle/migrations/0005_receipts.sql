CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  file_path text NOT NULL,
  file_name text,
  mime text,
  txid text,
  amount text,
  customer_name text,
  customer_cpf text,
  customer_phone text
);
GRANT SELECT ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read receipts" ON public.receipts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));