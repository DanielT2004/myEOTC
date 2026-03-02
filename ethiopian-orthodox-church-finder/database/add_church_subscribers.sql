-- Church mailing list: maps church_id to subscribed email addresses.
-- Anyone can subscribe (logged in or not). Church admins fetch this list when sending event notifications.

CREATE TABLE public.church_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(church_id, email)
);

CREATE INDEX idx_church_subscribers_church_id ON public.church_subscribers(church_id);

ALTER TABLE public.church_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe their email to an approved church (no auth required)
CREATE POLICY "Anyone can subscribe to approved churches"
  ON public.church_subscribers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.churches
      WHERE churches.id = church_subscribers.church_id
      AND churches.status = 'approved'
    )
  );

-- Church admins can view subscribers for their churches (needed when sending event notifications)
CREATE POLICY "Church admins can view their church subscribers"
  ON public.church_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.church_admins
      WHERE church_admins.church_id = church_subscribers.church_id
      AND church_admins.user_id = auth.uid()
    )
  );

-- Super admins can view all subscribers
CREATE POLICY "Super admins can view all church subscribers"
  ON public.church_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );
