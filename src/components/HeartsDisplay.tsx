import { Heart } from "lucide-react";
import { useLives } from "@/hooks/useLives";
import { useAuth } from "@/contexts/AuthContext";
export function HeartsDisplay() {
  const {
    lives,
    maxLives,
    refillTime,
    loading
  } = useLives();
  const {
    user
  } = useAuth();
  const [timeRemaining, setTimeRemaining] = React.useState("");
  const [isPremium, setIsPremium] = React.useState(false);
  React.useEffect(() => {
    if (!user) return;

    // Check if user is premium
    const checkPremium = async () => {
      const {
        data
      } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single();
      if (data) {
        setIsPremium(data.is_premium || false);
      }
    };
    checkPremium();
  }, [user]);
  React.useEffect(() => {
    if (!refillTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = refillTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining("");
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor(diff % 3600000 / 60000);
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [refillTime]);
  if (loading) return null;
  if (isPremium) return <div className="text-sm font-medium text-primary">∞ Premium</div>;
  const filledSections = lives;
  const totalSections = 5;
  return <div className="flex flex-col items-center gap-1">
      
      {lives < maxLives && timeRemaining && <span className="text-xs font-medium text-muted-foreground">{timeRemaining}</span>}
    </div>;
}
import React from "react";
import { supabase } from "@/integrations/supabase/client";