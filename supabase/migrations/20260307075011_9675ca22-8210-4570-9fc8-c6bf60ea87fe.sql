
-- Email logs table for tracking all sent transactional emails
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_type text NOT NULL, -- 'exam_results', 'weekly_report', 'ban_notice', 'warning', 'announcement', 'update'
  subject text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  metadata jsonb DEFAULT '{}',
  error_message text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- API keys table for external API access
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL, -- first 8 chars for identification
  permissions text[] NOT NULL DEFAULT '{}', -- 'analytics', 'revenue', 'users', 'content'
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email preferences per user
CREATE TABLE public.email_preferences (
  user_id uuid PRIMARY KEY,
  exam_results boolean DEFAULT true,
  weekly_reports boolean DEFAULT true,
  announcements boolean DEFAULT true,
  warnings boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Email logs: admins/staff can view all, users can view their own
CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all email logs" ON public.email_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));
CREATE POLICY "System can insert email logs" ON public.email_logs
  FOR INSERT WITH CHECK (true);

-- API keys: only admins can manage
CREATE POLICY "Admins can manage API keys" ON public.api_keys
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Email preferences: users manage their own
CREATE POLICY "Users can view own email preferences" ON public.email_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email preferences" ON public.email_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email preferences" ON public.email_preferences
  FOR UPDATE USING (auth.uid() = user_id);
