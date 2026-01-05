-- Fix the security definer view warning - use SECURITY INVOKER instead
-- Since we're just selecting safe columns, INVOKER is fine
DROP VIEW IF EXISTS public.safe_profiles;

CREATE VIEW public.safe_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  level,
  experience,
  lives,
  staff_badge,
  is_premium,
  daily_learning_time,
  total_learning_time,
  created_at
FROM public.profiles;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.safe_profiles TO authenticated;