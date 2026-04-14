-- Store settings key-value table
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.store_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default shipping fee
INSERT INTO public.store_settings (key, value) VALUES
  ('shipping_fee', '35'),
  ('whatsapp_number', '233241234567'),
  ('whatsapp_on_order', 'true'),
  ('store_name', 'Tillies Avenue');

-- Enable realtime on orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
