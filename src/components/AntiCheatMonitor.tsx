import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AntiCheatMonitorProps {
  gameMode: string;
  isActive: boolean;
  onCheatDetected?: () => void;
}

export const AntiCheatMonitor = ({ gameMode, isActive, onCheatDetected }: AntiCheatMonitorProps) => {
  const { user } = useAuth();
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    if (!isActive || !user) return;

    let lastFocusTime = Date.now();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        const timeAway = now - lastFocusTime;
        
        // Log tab switch
        logCheatEvent('tab_switch', {
          timeAway,
          timestamp: now
        });

        setTabSwitches(prev => prev + 1);

        // Warn user
        toast.warning("Tab switching detected! This is not allowed during this activity.");

        // If too many switches, trigger cheat detection
        if (tabSwitches >= 2) {
          onCheatDetected?.();
          toast.error("Multiple tab switches detected. Your attempt has been flagged.");
        }
      } else {
        lastFocusTime = Date.now();
      }
    };

    // Detect right-click (could be used to inspect or cheat)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logCheatEvent('right_click_attempt', { timestamp: Date.now() });
      toast.warning("Right-click is disabled during this activity.");
    };

    // Detect copy/paste attempts
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatEvent('copy_attempt', { timestamp: Date.now() });
      toast.warning("Copying is not allowed during this activity.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheatEvent('paste_attempt', { timestamp: Date.now() });
      toast.warning("Pasting is not allowed during this activity.");
    };

    // Detect keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U (dev tools)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        logCheatEvent('devtools_attempt', { key: e.key, timestamp: Date.now() });
        toast.warning("Developer tools access is blocked during this activity.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, user, tabSwitches, onCheatDetected]);

  const logCheatEvent = async (eventType: string, details: any) => {
    if (!user) return;

    try {
      await supabase.from('anti_cheat_logs').insert({
        user_id: user.id,
        event_type: eventType,
        game_mode: gameMode,
        details,
        severity: eventType === 'tab_switch' ? 'high' : 'medium'
      });
    } catch (error) {
      console.error('Failed to log cheat event:', error);
    }
  };

  return null; // This is a monitoring component with no UI
};

export default AntiCheatMonitor;