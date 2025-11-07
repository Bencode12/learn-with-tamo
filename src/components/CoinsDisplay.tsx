import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function CoinsDisplay() {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCoins = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (data) {
        setCoins(data.coins);
      }
    };

    fetchCoins();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('profile-coins-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload: any) => {
          if (payload.new) {
            setCoins(payload.new.coins);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
      <Coins className="h-4 w-4 text-yellow-600" />
      <span className="font-semibold text-yellow-900">{coins}</span>
    </div>
  );
}
