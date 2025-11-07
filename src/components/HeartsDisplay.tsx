import { Heart } from "lucide-react";
import { useLives } from "@/hooks/useLives";
import { useAuth } from "@/contexts/AuthContext";

export function HeartsDisplay() {
  const { lives, maxLives, refillTime, loading } = useLives();
  const { user } = useAuth();
  const [timeRemaining, setTimeRemaining] = React.useState("");
  const [isPremium, setIsPremium] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    
    // Check if user is premium
    const checkPremium = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
      
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
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [refillTime]);

  if (loading) return null;
  if (isPremium) return <div className="text-sm font-medium text-primary">∞ Premium</div>;

  const filledSections = lives;
  const totalSections = 5;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        {/* Circle background */}
        <div className="absolute inset-0 rounded-full border-2 border-border bg-background flex items-center justify-center">
          {/* Heart with sections */}
          <svg viewBox="0 0 24 24" className="w-7 h-7">
            <defs>
              <clipPath id="heartClip">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </clipPath>
            </defs>
            
            {/* Background heart (empty) */}
            <path 
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              className="fill-muted stroke-muted-foreground"
              strokeWidth="0.5"
            />
            
            {/* Filled sections */}
            <g clipPath="url(#heartClip)">
              {[...Array(totalSections)].map((_, i) => {
                const sectionHeight = 24 / totalSections;
                const y = 24 - (sectionHeight * (i + 1));
                const isFilled = i < filledSections;
                
                return (
                  <rect
                    key={i}
                    x="0"
                    y={y}
                    width="24"
                    height={sectionHeight + 0.5}
                    className={isFilled ? "fill-red-500" : "fill-transparent"}
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </div>
      {lives < maxLives && timeRemaining && (
        <span className="text-xs font-medium text-muted-foreground">{timeRemaining}</span>
      )}
    </div>
  );
}

import React from "react";
import { supabase } from "@/integrations/supabase/client";
