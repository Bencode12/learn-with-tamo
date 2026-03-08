-- Fix PUBLIC_DATA_EXPOSURE: Replace USING(true) SELECT on profiles with owner-only
DROP POLICY IF EXISTS "Users can view all public profile fields" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Grant public read via safe_profiles view (which excludes sensitive columns)
-- safe_profiles view already exists and excludes stripe_customer_id, stripe_subscription_id, etc.