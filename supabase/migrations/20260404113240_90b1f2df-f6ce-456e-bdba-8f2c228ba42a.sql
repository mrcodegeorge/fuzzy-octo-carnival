-- Drop and recreate the order status check constraint to include "paid"
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Add region column to delivery_zones for auto-matching
ALTER TABLE public.delivery_zones ADD COLUMN IF NOT EXISTS region text;
