-- Allow church admins to add subscribers (including themselves) to their church.
-- Needed when a church is first created (pending) so the admin becomes the first subscriber.

CREATE POLICY "Church admins can add subscribers to their church"
  ON public.church_subscribers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.churches
      WHERE churches.id = church_subscribers.church_id
      AND churches.admin_id = auth.uid()
    )
  );
