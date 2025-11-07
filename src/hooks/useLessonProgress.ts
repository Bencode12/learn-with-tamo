import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useLessonProgress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveProgress = async (data: {
    subjectId: string;
    chapterId: string;
    lessonId: string;
    completed: boolean;
    score?: number;
    timeSpent?: number;
  }) => {
    if (!user) {
      toast.error('You must be logged in to save progress');
      return { error: new Error('Not authenticated') };
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('lesson_progress').upsert({
        user_id: user.id,
        subject_id: data.subjectId,
        chapter_id: data.chapterId,
        lesson_id: data.lessonId,
        completed: data.completed,
        score: data.score || null,
        time_spent: data.timeSpent || 0,
        last_accessed: new Date().toISOString()
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getProgress = async (subjectId: string, chapterId: string, lessonId: string) => {
    if (!user) return { data: null, error: null };
    const result = await supabase.from('lesson_progress').select('*').eq('user_id', user.id).eq('subject_id', subjectId).eq('chapter_id', chapterId).eq('lesson_id', lessonId).maybeSingle();
    return { data: result.data, error: result.error };
  };

  const getAllProgress = async () => {
    if (!user) return { data: [], error: null };
    const result = await supabase.from('lesson_progress').select('*').eq('user_id', user.id).order('last_accessed', { ascending: false });
    return { data: result.data || [], error: result.error };
  };

  return { saveProgress, getProgress, getAllProgress, loading };
}
