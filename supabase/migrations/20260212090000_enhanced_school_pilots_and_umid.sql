-- Enhance school pilots with time ranges and add UMID system

-- Add time range columns to school_pilots table
ALTER TABLE public.school_pilots 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create UMID (User Main ID) system
CREATE TABLE IF NOT EXISTS public.user_umid (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  umid TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_umid_user_id ON public.user_umid(user_id);
CREATE INDEX IF NOT EXISTS idx_user_umid_umid ON public.user_umid(umid);

-- Enable RLS for UMID table
ALTER TABLE public.user_umid ENABLE ROW LEVEL SECURITY;

-- Create policies for UMID
CREATE POLICY "Users can view own UMID"
ON public.user_umid FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own UMID"
ON public.user_umid FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own UMID"
ON public.user_umid FOR UPDATE
USING (auth.uid() = user_id);

-- Create curriculum subjects table
CREATE TABLE IF NOT EXISTS public.curriculum_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  field TEXT NOT NULL,
  grade_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for curriculum subjects
CREATE INDEX IF NOT EXISTS idx_curriculum_subjects_field ON public.curriculum_subjects(field);
CREATE INDEX IF NOT EXISTS idx_curriculum_subjects_grade ON public.curriculum_subjects(grade_level);

-- Enable RLS for curriculum subjects
ALTER TABLE public.curriculum_subjects ENABLE ROW LEVEL SECURITY;

-- Create policies for curriculum subjects
CREATE POLICY "Everyone can view curriculum subjects"
ON public.curriculum_subjects FOR SELECT
USING (true);

CREATE POLICY "Staff can manage curriculum subjects"
ON public.curriculum_subjects FOR ALL
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create staff chat channels table
CREATE TABLE IF NOT EXISTS public.staff_chat_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staff channel members table
CREATE TABLE IF NOT EXISTS public.staff_channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.staff_chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, moderator, admin
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create enhanced staff chat messages table
CREATE TABLE IF NOT EXISTS public.staff_chat_messages_enhanced (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.staff_chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, system, attachment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_chat_channels_created_by ON public.staff_chat_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_staff_channel_members_channel ON public.staff_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_staff_channel_members_user ON public.staff_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_chat_messages_enhanced_channel ON public.staff_chat_messages_enhanced(channel_id);
CREATE INDEX IF NOT EXISTS idx_staff_chat_messages_enhanced_sender ON public.staff_chat_messages_enhanced(sender_id);

-- Enable RLS for new tables
ALTER TABLE public.staff_chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_chat_messages_enhanced ENABLE ROW LEVEL SECURITY;

-- Create policies for staff chat channels
CREATE POLICY "Staff can view channels"
ON public.staff_chat_channels FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can create channels"
ON public.staff_chat_channels FOR INSERT
WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can update/delete own channels"
ON public.staff_chat_channels FOR ALL
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create policies for staff channel members
CREATE POLICY "Staff can view channel members"
ON public.staff_channel_members FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can join channels"
ON public.staff_channel_members FOR INSERT
WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can leave channels"
ON public.staff_channel_members FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create policies for enhanced staff chat messages
CREATE POLICY "Staff can view messages in channels they belong to"
ON public.staff_chat_messages_enhanced FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.staff_channel_members 
    WHERE channel_id = staff_chat_messages_enhanced.channel_id 
    AND user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Staff can send messages to channels they belong to"
ON public.staff_chat_messages_enhanced FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.staff_channel_members 
    WHERE channel_id = channel_id 
    AND user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create banned users table
CREATE TABLE IF NOT EXISTS public.banned_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  ban_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ban_end TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for banned users
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_banned_by ON public.banned_users(banned_by);

-- Enable RLS for banned users
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Create policies for banned users
CREATE POLICY "Staff can view banned users"
ON public.banned_users FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can ban users"
ON public.banned_users FOR INSERT
WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update/delete bans"
ON public.banned_users FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.banned_users 
    WHERE user_id = user_uuid 
    AND (is_permanent = true OR ban_end > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate UMID for users
CREATE OR REPLACE FUNCTION generate_umid()
RETURNS TEXT AS $$
DECLARE
  umid TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric UMID
    umid := upper(substr(md5(random()::text), 1, 8));
    
    -- Check if UMID already exists
    SELECT EXISTS(SELECT 1 FROM public.user_umid WHERE umid = generate_umid.umid) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN umid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create UMID for new users
CREATE OR REPLACE FUNCTION create_user_umid()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_umid (user_id, umid)
  VALUES (NEW.id, generate_umid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_umid();

-- Update existing school pilots with default dates
UPDATE public.school_pilots 
SET start_date = COALESCE(start_date, created_at::date),
    end_date = COALESCE(end_date, created_at::date + INTERVAL '1 year'),
    status = COALESCE(status, 'active')
WHERE start_date IS NULL OR end_date IS NULL;