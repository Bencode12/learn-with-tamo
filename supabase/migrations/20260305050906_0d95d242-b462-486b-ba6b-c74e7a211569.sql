CREATE UNIQUE INDEX IF NOT EXISTS synced_grades_unique_entry 
ON public.synced_grades (user_id, source, subject, date) 
WHERE date IS NOT NULL;