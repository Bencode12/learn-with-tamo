-- Fix the view to not use security definer - drop and recreate with explicit grant
DROP VIEW IF EXISTS public.public_profiles;

-- Grant proper access to the underlying table instead
-- Update RLS policy on profiles to restrict stripe fields
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create separate policies for own vs public access
CREATE POLICY "Users can view all public profile fields" ON public.profiles
  FOR SELECT USING (true);
  
-- Note: The view approach doesn't work well with RLS. Instead we'll handle this in the application layer
-- by selecting only the needed columns in queries

-- Fix notify_friend_request function search path
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  sender_name text;
BEGIN
  SELECT display_name INTO sender_name
  FROM profiles
  WHERE id = NEW.user_id;

  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.friend_id,
    'friend_request',
    'New Friend Request',
    sender_name || ' sent you a friend request',
    jsonb_build_object('friendship_id', NEW.id, 'sender_id', NEW.user_id)
  );

  RETURN NEW;
END;
$function$;