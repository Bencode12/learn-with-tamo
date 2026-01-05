-- Add unique constraint on user_credentials for proper upsert
ALTER TABLE public.user_credentials 
ADD CONSTRAINT user_credentials_user_service_unique 
UNIQUE (user_id, service_name);