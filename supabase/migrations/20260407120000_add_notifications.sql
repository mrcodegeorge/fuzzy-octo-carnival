-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'order_status', 'payment', etc.
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for notifications
alter publication supabase_realtime add table public.notifications;

-- Function to handle order status updates
CREATE OR REPLACE FUNCTION public.handle_order_status_update_notify()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  email_type TEXT;
BEGIN
  -- Determine notification content based on new status
  CASE NEW.status
    WHEN 'confirmed' THEN
      notification_title := 'Order Confirmed';
      notification_message := 'Your order #' || substring(NEW.id::text, 1, 8) || ' has been confirmed.';
      email_type := 'order_confirmation';
    WHEN 'processing' THEN
      notification_title := 'Order Processing';
      notification_message := 'We are now processing your order #' || substring(NEW.id::text, 1, 8) || '.';
    WHEN 'shipped' THEN
      notification_title := 'Order Shipped';
      notification_message := 'Your order #' || substring(NEW.id::text, 1, 8) || ' is on its way!';
      email_type := 'shipping_update';
    WHEN 'delivered' THEN
      notification_title := 'Order Delivered';
      notification_message := 'Your order #' || substring(NEW.id::text, 1, 8) || ' has been delivered. Enjoy!';
    WHEN 'cancelled' THEN
      notification_title := 'Order Cancelled';
      notification_message := 'Your order #' || substring(NEW.id::text, 1, 8) || ' has been cancelled.';
    ELSE
      notification_title := 'Order Update';
      notification_message := 'Status of order #' || substring(NEW.id::text, 1, 8) || ' is now ' || NEW.status || '.';
  END CASE;

  -- Create in-app notification
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (NEW.user_id, notification_title, notification_message, 'order_status', '/account?tab=orders');

  -- Invoke email Edge Function if applicable
  IF email_type IS NOT NULL THEN
    -- Note: This requires net.http (which is enabled on Supabase)
    -- We use a background task to avoid blocking the trigger
    -- Wait: Supabase triggers are synchronous. For production, it's better to use a queue
    -- but for this MVP we'll invoke the function directly or let the trigger finish.
    -- Calling net.http from SQL is a specific extension.
    -- A cleaner way is to use a cron job or just let the Edge Function be called.
    -- For now, we'll just stick to the in-app notification as the core "live" update.
    -- Emails are often better handled via Page functions or direct invocation from the backend logic.
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for order status changes
CREATE TRIGGER on_order_status_update_notify
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_order_status_update_notify();
