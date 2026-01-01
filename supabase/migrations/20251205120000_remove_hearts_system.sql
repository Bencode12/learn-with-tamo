-- Remove hearts/lives system from database
-- Drop tables related to hearts/lives system
DROP TABLE IF EXISTS public.user_lives;

-- Remove columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS lives;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS lives_refill_at;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS last_life_lost_at;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS max_lives;

-- Drop the refill_user_lives function if it exists
DROP FUNCTION IF EXISTS refill_user_lives();