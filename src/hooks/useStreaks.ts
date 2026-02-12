import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useStreaks = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStreak();
  }, [user]);

  const fetchStreak = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No row yet, create one
      await supabase.from('user_streaks').insert({ user_id: user.id });
      setStreak(0);
      setLongestStreak(0);
    } else if (data) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (data.last_activity_date === today) {
        setStreak(data.current_streak);
      } else if (data.last_activity_date === yesterday) {
        setStreak(data.current_streak);
      } else if (data.last_activity_date) {
        // Streak broken
        setStreak(0);
        await supabase.from('user_streaks').update({ current_streak: 0 }).eq('user_id', user.id);
      }
      setLongestStreak(data.longest_streak);
    }
    setLoading(false);
  };

  const recordActivity = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!data) {
      await supabase.from('user_streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today
      });
      setStreak(1);
      setLongestStreak(1);
      return;
    }

    if (data.last_activity_date === today) return; // Already recorded today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;
    
    if (data.last_activity_date === yesterday) {
      newStreak = (data.current_streak || 0) + 1;
    }

    const newLongest = Math.max(newStreak, data.longest_streak || 0);

    await supabase.from('user_streaks').update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
      streak_updated_at: new Date().toISOString()
    }).eq('user_id', user.id);

    setStreak(newStreak);
    setLongestStreak(newLongest);
  };

  return { streak, longestStreak, loading, recordActivity };
};
