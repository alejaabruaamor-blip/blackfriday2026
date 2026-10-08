CREATE POLICY "admins delete receipts" ON public.receipts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT DELETE ON public.receipts TO authenticated;