
-- Add stock quantity to products
ALTER TABLE public.products ADD COLUMN stock_quantity integer DEFAULT 0;

-- Add refund tracking to orders
ALTER TABLE public.orders ADD COLUMN refunded_amount numeric DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN refund_status text DEFAULT null;
