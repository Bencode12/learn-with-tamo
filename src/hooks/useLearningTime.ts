import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FREE_DAILY_LIMIT_MINUTES = 120; // 2 hours

export function useLearningTime() {
  const { user } = useAuth();
  const [dailyTime, setDailyTime] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchLearningTime();
  }, [user]);

  const fetchLearningTime = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('daily_learning_time, learning_time_reset, is_premium')
      .eq('id', user.id)
      .single();

    if (data) {
      const today = new Date().toISOString().split('T')[0];
      const resetDate = data.learning_time_reset;

      // Reset daily time if it's a new day
      if (resetDate !== today) {
        await supabase
          .from('profiles')
          .update({ 
            daily_learning_time: 0, 
            learning_time_reset: today 
          })
          .eq('id', user.id);
        setDailyTime(0);
      } else {
        setDailyTime(data.daily_learning_time || 0);
      }

      setIsPremium(data.is_premium || false);
    }
    setLoading(false);
  };

  const startTracking = useCallback(() => {
    setStartTime(Date.now());
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(async () => {
    if (!user || !startTime) return 0;

    const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
    setIsTracking(false);
    setStartTime(null);

    if (elapsedMinutes > 0) {
      const newDailyTime = dailyTime + elapsedMinutes;
      setDailyTime(newDailyTime);

      await supabase
        .from('profiles')
        .update({ 
          daily_learning_time: newDailyTime,
          total_learning_time: supabase.rpc ? newDailyTime : newDailyTime
        })
        .eq('id', user.id);
    }

    return elapsedMinutes;
  }, [user, startTime, dailyTime]);

  const canLearn = useCallback((): boolean => {
    if (isPremium) return true;
    return dailyTime < FREE_DAILY_LIMIT_MINUTES;
  }, [isPremium, dailyTime]);

  const getRemainingTime = useCallback((): number => {
    if (isPremium) return Infinity;
    return Math.max(0, FREE_DAILY_LIMIT_MINUTES - dailyTime);
  }, [isPremium, dailyTime]);

  const formatRemainingTime = useCallback((): string => {
    const remaining = getRemainingTime();
    if (remaining === Infinity) return 'Unlimited';
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [getRemainingTime]);

  const checkAndWarn = useCallback(() => {
    if (!canLearn()) {
      toast.error('Daily learning limit reached! Upgrade to Premium for unlimited learning.');
      return false;
    }
    const remaining = getRemainingTime();
    if (remaining <= 15 && remaining > 0 && !isPremium) {
      toast.warning(`Only ${remaining} minutes of learning time left today!`);
    }
    return true;
  }, [canLearn, getRemainingTime, isPremium]);

  return {
    dailyTime,
    isPremium,
    loading,
    isTracking,
    startTracking,
    stopTracking,
    canLearn,
    getRemainingTime,
    formatRemainingTime,
    checkAndWarn,
    FREE_DAILY_LIMIT_MINUTES
  };
}
