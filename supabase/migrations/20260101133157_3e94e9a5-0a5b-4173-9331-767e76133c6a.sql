-- Drop the security definer view and recreate as regular view
DROP VIEW IF EXISTS public.public_profiles;

-- Create a regular view that hides sensitive Stripe data
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  level,
  experience,
  is_premium,
  staff_badge,
  created_at
FROM public.profiles;

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.refill_user_lives()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE user_lives
  SET 
    lives = max_lives,
    lives_refill_at = NULL
  WHERE lives < max_lives 
    AND lives_refill_at IS NOT NULL 
    AND lives_refill_at <= NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;