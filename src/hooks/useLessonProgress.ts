import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SaveProgressData {
  lessonId: string;
  videoCompleted?: boolean;
  worksheetCompleted?: boolean;
  quizCompleted?: boolean;
  quizScore?: number;
  timeSpent?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
}

export function useLessonProgress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveProgress = async (data: SaveProgressData) => {
    if (!user) {
      toast.error('You must be logged in to save progress');
      return { error: new Error('Not authenticated') };
    }

    setLoading(true);
    try {
      const progressData: any = {
        user_id: user.id,
        lesson_id: data.lessonId,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (data.videoCompleted !== undefined) progressData.video_completed = data.videoCompleted;
      if (data.worksheetCompleted !== undefined) progressData.worksheet_completed = data.worksheetCompleted;
      if (data.quizCompleted !== undefined) progressData.quiz_completed = data.quizCompleted;
      if (data.quizScore !== undefined) progressData.quiz_score = data.quizScore;
      if (data.timeSpent !== undefined) progressData.time_spent = data.timeSpent;
      if (data.status) progressData.status = data.status;

      if (data.quizCompleted && data.videoCompleted && data.worksheetCompleted) {
        progressData.completed_at = new Date().toISOString();
        progressData.status = 'completed';
      }

      const { error } = await supabase.from('lesson_progress').upsert(progressData);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error saving progress:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
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
