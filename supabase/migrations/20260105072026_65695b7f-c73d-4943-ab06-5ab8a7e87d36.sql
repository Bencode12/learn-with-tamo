-- Fix PUBLIC_DATA_EXPOSURE: Create safe view for profile data
-- The view will be used for leaderboard, friend lookups, etc.

-- Create a safe view that excludes sensitive Stripe data
CREATE OR REPLACE VIEW public.safe_profiles AS
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