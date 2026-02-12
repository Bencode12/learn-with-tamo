import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "./ui/progress";

export function LivesDisplay() {
  const { user } = useAuth();
  const [lives, setLives] = useState(5);
  const [refillTime, setRefillTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchLives = async () => {
      const { data } = await supabase
        .from('user_lives')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setLives(data.lives);
        if (data.lives_refill_at) {
          setRefillTime(new Date(data.lives_refill_at));
        }
      }
    };

    fetchLives();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-lives-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_lives',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          if (payload.new) {
            setLives(payload.new.lives);
            if (payload.new.lives_refill_at) {
              setRefillTime(new Date(payload.new.lives_refill_at));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!refillTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = refillTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("");
        setRefillTime(null);
        // Refetch lives
        if (user) {
          supabase
            .from('user_lives')
            .select('*')
            .eq('user_id', user.id)
            .single()
            .then(({ data }) => {
              if (data) setLives(data.lives);
            });
        }
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [refillTime, user]);

  return (
    <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Heart
            key={i}
            className={`h-4 w-4 ${
              i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {lives < 5 && timeRemaining && (
        <span className="text-xs font-medium text-red-700">{timeRemaining}</span>
      )}
    </div>
  );
}
