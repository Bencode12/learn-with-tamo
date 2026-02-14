-- Clean up any remaining Švietimo Centras records
DELETE FROM public.user_credentials 
WHERE service_name = 'svietimocentras';

-- Clean up any related synced grades
DELETE FROM public.synced_grades 
WHERE source = 'svietimocentras';

-- Update any enum values if they exist
UPDATE public.user_credentials 
SET service_name = 'deprecated_svietimocentras' 
WHERE service_name = 'svietimocentras';

-- Log the cleanup
INSERT INTO public.notifications (user_id, type, title, message, created_at)
SELECT DISTINCT uc.user_id, 'system', 'Integration Update', 'Švietimo Centras integration has been removed. Please use Tamo.lt or ManoDienynas.lt instead.', NOW()
FROM public.user_credentials uc
WHERE uc.service_name = 'svietimocentras' OR uc.service_name = 'deprecated_svietimocentras';