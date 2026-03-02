-- Track when a notification email was sent for an event (one email per event).
-- When set, the "Notify members" button is disabled/grayed out.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

COMMENT ON COLUMN public.events.notification_sent_at IS 'When the church admin sent the member notification email for this event; NULL if not sent yet.';
