import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTherapistCheckin = () => {
  const { user } = useAuth();
  const [shouldShowCheckin, setShouldShowCheckin] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkLastCheckin = async () => {
      const { data } = await supabase
        .from('therapist_checkins')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!data || data.length === 0) {
        // Never checked in, show modal
        setShouldShowCheckin(true);
        return;
      }

      const lastCheckin = new Date(data[0].created_at);
      const now = new Date();
      const daysSinceLastCheckin = Math.floor((now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24));

      // Show modal if it's been more than 7 days
      if (daysSinceLastCheckin >= 7) {
        setShouldShowCheckin(true);
      }
    };

    checkLastCheckin();
  }, [user]);

  return { shouldShowCheckin, setShouldShowCheckin };
};