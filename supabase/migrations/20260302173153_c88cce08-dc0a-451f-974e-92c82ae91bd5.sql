
-- Fix infinite recursion: classes SELECT policy references class_students, 
-- and class_students ALL policy references classes, creating a loop.

-- 1. Create a SECURITY DEFINER function to check class membership without RLS
CREATE OR REPLACE FUNCTION public.is_class_member(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_students
    WHERE student_id = _user_id AND class_id = _class_id
  )
$$;

-- 2. Create a SECURITY DEFINER function to check class ownership
CREATE OR REPLACE FUNCTION public.is_class_teacher(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = _class_id AND teacher_id = _user_id
  )
$$;

-- 3. Create a function to check if user is teacher of student's class
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(_teacher_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    WHERE cs.student_id = _student_id AND c.teacher_id = _teacher_id
  )
$$;

-- 4. Drop problematic policies on classes
DROP POLICY IF EXISTS "Students can view classes they belong to" ON public.classes;

-- 5. Recreate without subquery to class_students
CREATE POLICY "Students can view classes they belong to"
ON public.classes
FOR SELECT
USING (public.is_class_member(auth.uid(), id));

-- 6. Drop problematic policy on class_students
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.class_students;

-- 7. Recreate without subquery to classes
CREATE POLICY "Teachers can manage students in their classes"
ON public.class_students
FOR ALL
USING (public.is_class_teacher(auth.uid(), class_id));

-- 8. Fix synced_grades teacher policy
DROP POLICY IF EXISTS "Teachers can view grades of students in their classes" ON public.synced_grades;

CREATE POLICY "Teachers can view grades of students in their classes"
ON public.synced_grades
FOR SELECT
USING (public.is_teacher_of_student(auth.uid(), user_id));
