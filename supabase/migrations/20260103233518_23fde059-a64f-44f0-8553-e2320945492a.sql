-- Create learning plans table to store user-generated learning programs
CREATE TABLE public.learning_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  fields TEXT[] NOT NULL DEFAULT '{}',
  duration_months INTEGER NOT NULL DEFAULT 1,
  assessment_score INTEGER,
  assessment_answers JSONB,
  weekly_plan JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  current_week INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plans
CREATE POLICY "Users can view their own learning plans"
ON public.learning_plans
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own plans
CREATE POLICY "Users can create their own learning plans"
ON public.learning_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own plans
CREATE POLICY "Users can update their own learning plans"
ON public.learning_plans
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own plans
CREATE POLICY "Users can delete their own learning plans"
ON public.learning_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_learning_plans_updated_at
BEFORE UPDATE ON public.learning_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create staff chat messages table
CREATE TABLE public.staff_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff_chat_messages ENABLE ROW LEVEL SECURITY;

-- Staff can view all messages
CREATE POLICY "Staff can view chat messages"
ON public.staff_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Staff can send messages
CREATE POLICY "Staff can send chat messages"
ON public.staff_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Enable realtime for staff chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_chat_messages;