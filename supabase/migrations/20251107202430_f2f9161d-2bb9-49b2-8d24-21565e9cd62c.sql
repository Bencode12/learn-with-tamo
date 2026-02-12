-- Remove coins from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS coins;

-- Add friends request status enum if not exists
DO $$ BEGIN
  CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update friendships table with proper structure
ALTER TABLE friendships 
  DROP COLUMN IF EXISTS status,
  ADD COLUMN status friendship_status DEFAULT 'pending',
  ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Update user_lives table to add max_lives
ALTER TABLE user_lives 
  ADD COLUMN IF NOT EXISTS max_lives integer DEFAULT 5;

-- Function to refill lives automatically
CREATE OR REPLACE FUNCTION refill_user_lives()
RETURNS void AS $$
BEGIN
  UPDATE user_lives
  SET 
    lives = max_lives,
    lives_refill_at = NULL
  WHERE lives < max_lives 
    AND lives_refill_at IS NOT NULL 
    AND lives_refill_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update friendships RLS policies
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can respond to friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = friend_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Add realtime support for friendships
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function to send friend request notification
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
BEGIN
  -- Get sender's display name
  SELECT display_name INTO sender_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Create notification for recipient
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for friend requests
DROP TRIGGER IF EXISTS on_friend_request ON friendships;
CREATE TRIGGER on_friend_request
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();