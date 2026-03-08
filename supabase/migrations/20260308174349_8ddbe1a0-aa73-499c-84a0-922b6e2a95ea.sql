CREATE POLICY "Anyone can submit school pilot requests"
ON public.school_pilots
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');