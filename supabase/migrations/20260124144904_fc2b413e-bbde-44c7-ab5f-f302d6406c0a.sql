-- Add 'teacher' role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- Create classes table for teacher class management
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  class_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
  subject TEXT,
  grade_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create class_students junction table
CREATE TABLE public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  UNIQUE(class_id, student_id)
);

-- Create table for storing grade sync data from Tamo/ManoDienynas
CREATE TABLE public.synced_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('tamo', 'manodienynas')),
  subject TEXT NOT NULL,
  grade INTEGER,
  grade_type TEXT,
  date DATE,
  semester TEXT,
  teacher_name TEXT,
  notes TEXT,
  raw_data JSONB,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synced_grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Teachers can manage their own classes"
ON public.classes FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view classes they belong to"
ON public.classes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_students
    WHERE class_id = classes.id AND student_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view class by code for joining"
ON public.classes FOR SELECT
USING (is_active = true);

-- RLS Policies for class_students
CREATE POLICY "Teachers can manage students in their classes"
ON public.class_students FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = class_students.class_id AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own enrollments"
ON public.class_students FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can join classes"
ON public.class_students FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can leave classes"
ON public.class_students FOR DELETE
USING (auth.uid() = student_id);

-- RLS Policies for synced_grades
CREATE POLICY "Users can manage their own grades"
ON public.synced_grades FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view grades of students in their classes"
ON public.synced_grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.student_id = synced_grades.user_id AND c.teacher_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_classes_class_code ON public.classes(class_code);
CREATE INDEX idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX idx_class_students_student_id ON public.class_students(student_id);
CREATE INDEX idx_synced_grades_user_id ON public.synced_grades(user_id);
CREATE INDEX idx_synced_grades_source ON public.synced_grades(source);

-- Trigger for updated_at
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();