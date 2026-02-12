import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLives() {
  const { user } = useAuth();
  const [lives, setLives] = useState(5);
  const [maxLives, setMaxLives] = useState(5);
  const [refillTime, setRefillTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchLives();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-lives-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_lives',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          if (payload.new) {
            setLives(payload.new.lives);
            setMaxLives(payload.new.max_lives);
            setRefillTime(payload.new.lives_refill_at ? new Date(payload.new.lives_refill_at) : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchLives = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('user_lives')
      .select('lives, max_lives, lives_refill_at')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setLives(data.lives);
      setMaxLives(data.max_lives);
      setRefillTime(data.lives_refill_at ? new Date(data.lives_refill_at) : null);
    }
    setLoading(false);
  };

  const deductLife = async (): Promise<boolean> => {
    if (!user) return false;

    if (lives <= 0) {
      toast.error('You have no lives left! Wait for refill or upgrade to Premium.');
      return false;
    }

    try {
      const newLives = lives - 1;
      const now = new Date();
      
      // Calculate refill time (30 minutes per life)
      const refillAt = newLives < maxLives
        ? new Date(now.getTime() + 30 * 60 * 1000)
        : null;

      const { error } = await supabase
        .from('user_lives')
        .update({
          lives: newLives,
          last_life_lost_at: now.toISOString(),
          lives_refill_at: refillAt?.toISOString() || null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setLives(newLives);
      setRefillTime(refillAt);

      if (newLives === 0) {
        toast.warning('No lives left! Lives refill in 30 minutes.');
      }

      return true;
    } catch (error) {
      console.error('Error deducting life:', error);
      toast.error('Failed to deduct life');
      return false;
    }
  };

  const refillLives = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_lives')
        .update({
          lives: maxLives,
          lives_refill_at: null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setLives(maxLives);
      setRefillTime(null);
      toast.success('Lives refilled!');
    } catch (error) {
      console.error('Error refilling lives:', error);
    }
  };

  return {
    lives,
    maxLives,
    refillTime,
    loading,
    deductLife,
    refillLives
  };
}
