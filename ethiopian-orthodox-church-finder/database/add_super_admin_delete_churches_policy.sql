-- Allow super admins to delete churches (e.g. when rejecting a registration).
-- Run this if your database was created before this policy existed.
CREATE POLICY "Super admins can delete churches"
  ON public.churches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );
