
-- 1. Lock down user_roles: only admins can INSERT/UPDATE/DELETE
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Remove orders from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;

-- 3. Restrict product_reviews INSERT to authenticated users only
DROP POLICY IF EXISTS "Users can create reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can create reviews"
ON public.product_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Restrict store_settings public read to exclude sensitive keys
DROP POLICY IF EXISTS "Anyone can read settings" ON public.store_settings;
CREATE POLICY "Anyone can read non-sensitive settings"
ON public.store_settings
FOR SELECT
TO public
USING (key NOT LIKE 'paystack_secret%');
