
-- Create class_messages table for teacher-to-student messaging
CREATE TABLE public.class_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;

-- Teachers can send messages to their classes
CREATE POLICY "Teachers can insert messages to their classes"
  ON public.class_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (is_class_teacher(auth.uid(), class_id));

-- Teachers can view messages in their classes
CREATE POLICY "Teachers can view messages in their classes"
  ON public.class_messages
  FOR SELECT
  TO authenticated
  USING (is_class_teacher(auth.uid(), class_id));

-- Teachers can delete their own messages
CREATE POLICY "Teachers can delete their own messages"
  ON public.class_messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid() AND is_class_teacher(auth.uid(), class_id));

-- Students can view messages in classes they belong to
CREATE POLICY "Students can view messages in their classes"
  ON public.class_messages
  FOR SELECT
  TO authenticated
  USING (is_class_member(auth.uid(), class_id));
