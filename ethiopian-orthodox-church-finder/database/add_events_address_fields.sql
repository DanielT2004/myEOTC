-- Add address, city, state, zip, and coordinates to events table
-- Backfill location into address for existing rows (address defaults to location)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT NULL;

-- Backfill: for existing events, set address from location (city/state/zip stay null for legacy)
UPDATE public.events SET address = location WHERE address IS NULL AND location IS NOT NULL;

-- Indexes for event search by city/state
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_state ON public.events(state);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
