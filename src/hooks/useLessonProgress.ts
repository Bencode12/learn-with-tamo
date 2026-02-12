import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SaveProgressData {
  subjectId: string;
  chapterId: string;
  lessonId: string;
  completed?: boolean;
  quizScore?: number;
  timeSpent?: number;
}

export function useLessonProgress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveProgress = async (data: SaveProgressData) => {
    if (!user) return { data: null, error: { message: 'Not authenticated' } };
    
    setLoading(true);
    try {
      const progressData: any = {
        user_id: user.id,
        subject_id: data.subjectId,
        chapter_id: data.chapterId,
        lesson_id: data.lessonId,
        last_accessed: new Date().toISOString()
      };

      if (data.completed !== undefined) progressData.completed = data.completed;
      if (data.quizScore !== undefined) progressData.score = data.quizScore;
      if (data.timeSpent !== undefined) progressData.time_spent = data.timeSpent;

      const { data: result, error } = await supabase
        .from('lesson_progress')
        .upsert(progressData, {
          onConflict: 'user_id,subject_id,chapter_id,lesson_id'
        })
        .select()
        .single();

      setLoading(false);
      return { data: result, error };
    } catch (error: any) {
      setLoading(false);
      return { data: null, error };
    }
  };

  const getProgress = async (lessonId: string) => {
    if (!user) return { data: null, error: null };
    
    const result = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    
    return result;
  };

  const getAllProgress = async () => {
    if (!user) return { data: [], error: null };
    
    const result = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_accessed_at', { ascending: false });
    
    return { data: result.data || [], error: result.error };
  };

  return { saveProgress, getProgress, getAllProgress, loading };
}
