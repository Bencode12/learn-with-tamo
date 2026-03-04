
-- Add skill rating (ELO-like) to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skill_rating integer NOT NULL DEFAULT 1000;

-- Add lesson-level progress fields for tracking accuracy and adaptive plans
ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS accuracy numeric DEFAULT NULL;
ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS plan_id uuid DEFAULT NULL;
ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS week_number integer DEFAULT NULL;
ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS lesson_number integer DEFAULT NULL;
