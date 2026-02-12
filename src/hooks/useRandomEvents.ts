import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RandomEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  questions: any[];
  time_limit_seconds: number;
  xp_reward: number;
}

export function useRandomEvents() {
  const { user } = useAuth();
  const [currentEvent, setCurrentEvent] = useState<RandomEvent | null>(null);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [completedEvents, setCompletedEvents] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchCompletedEvents();
    }
  }, [user]);

  const fetchCompletedEvents = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('random_event_completions')
      .select('event_id')
      .eq('user_id', user.id);

    if (data) {
      setCompletedEvents(data.map(e => e.event_id));
    }
  };

  const checkForRandomEvent = useCallback(async () => {
    if (!user) return;

    // 10% chance of random event triggering
    if (Math.random() > 0.1) return;

    const { data: events } = await supabase
      .from('random_events')
      .select('*')
      .or('active_until.is.null,active_until.gt.now()')
      .limit(5);

    if (events && events.length > 0) {
      const availableEvents = events.filter(e => !completedEvents.includes(e.id));
      if (availableEvents.length > 0) {
        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        setCurrentEvent({
          ...randomEvent,
          questions: randomEvent.questions as any[]
        });
        setIsEventOpen(true);
      }
    }
  }, [user, completedEvents]);

  const closeEvent = () => {
    setIsEventOpen(false);
    if (currentEvent) {
      setCompletedEvents(prev => [...prev, currentEvent.id]);
    }
    setCurrentEvent(null);
  };

  const triggerEvent = async (eventType?: string) => {
    const query = supabase
      .from('random_events')
      .select('*')
      .or('active_until.is.null,active_until.gt.now()');

    if (eventType) {
      query.eq('event_type', eventType);
    }

    const { data: events } = await query.limit(5);

    if (events && events.length > 0) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setCurrentEvent({
        ...randomEvent,
        questions: randomEvent.questions as any[]
      });
      setIsEventOpen(true);
    }
  };

  return {
    currentEvent,
    isEventOpen,
    checkForRandomEvent,
    closeEvent,
    triggerEvent
  };
}
