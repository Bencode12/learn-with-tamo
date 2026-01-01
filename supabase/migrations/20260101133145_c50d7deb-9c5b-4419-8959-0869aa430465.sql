-- Create secure credentials table for Tamo/ManoDienynas
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, service_name)
);

-- Enable RLS
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only access their own credentials
CREATE POLICY "Users can view their own credentials" ON public.user_credentials
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own credentials" ON public.user_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own credentials" ON public.user_credentials
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own credentials" ON public.user_credentials
  FOR DELETE USING (auth.uid() = user_id);

-- Add subscription_tier to profiles for tracking plan type
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Create a view that hides sensitive Stripe data from public access
CREATE OR REPLACE VIEW public.public_profiles AS
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