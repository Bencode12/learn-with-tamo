
-- Create table for saving self-learning workspace content
CREATE TABLE public.self_learning_workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  latex_content TEXT DEFAULT '',
  browser_url TEXT DEFAULT 'https://en.wikipedia.org',
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

ALTER TABLE public.self_learning_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspaces"
ON public.self_learning_workspaces FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workspaces"
ON public.self_learning_workspaces FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
ON public.self_learning_workspaces FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
ON public.self_learning_workspaces FOR DELETE
USING (auth.uid() = user_id);
