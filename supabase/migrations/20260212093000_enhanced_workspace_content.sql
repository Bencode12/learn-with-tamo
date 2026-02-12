-- Enhance workspace content storage for all editor types

-- Add new columns to self_learning_workspaces table
ALTER TABLE public.self_learning_workspaces 
ADD COLUMN IF NOT EXISTS document_content TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS presentation_content TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS spreadsheet_content TEXT DEFAULT '';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_self_learning_workspaces_user_subject 
ON public.self_learning_workspaces(user_id, subject_id);

-- Update existing policies to include new columns
DROP POLICY IF EXISTS "Users can view own workspaces" ON public.self_learning_workspaces;
DROP POLICY IF EXISTS "Users can create own workspaces" ON public.self_learning_workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON public.self_learning_workspaces;
DROP POLICY IF EXISTS "Users can delete own workspaces" ON public.self_learning_workspaces;

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

-- Update existing workspaces with empty content for new fields
UPDATE public.self_learning_workspaces 
SET 
  document_content = COALESCE(document_content, ''),
  presentation_content = COALESCE(presentation_content, ''),
  spreadsheet_content = COALESCE(spreadsheet_content, '')
WHERE 
  document_content IS NULL 
  OR presentation_content IS NULL 
  OR spreadsheet_content IS NULL;