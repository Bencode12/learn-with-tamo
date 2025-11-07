import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useMultiplayer = (roomCode?: string) => {
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomCode) {
      fetchMatch();
      subscribeToMatch();
    }
  }, [roomCode]);

  const fetchMatch = async () => {
    if (!roomCode) return;

    const { data, error } = await supabase
      .from('multiplayer_matches')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error) {
      console.error('Error fetching match:', error);
    } else {
      setMatch(data);
      fetchParticipants(data.id);
    }
  };

  const fetchParticipants = async (matchId: string) => {
    const { data, error } = await supabase
      .from('match_participants')
      .select(`
        *,
        profiles:user_id (username, display_name, level)
      `)
      .eq('match_id', matchId)
      .is('left_at', null);

    if (error) {
      console.error('Error fetching participants:', error);
    } else {
      setParticipants(data || []);
    }
  };

  const subscribeToMatch = () => {
    if (!roomCode) return;

    const matchChannel = supabase
      .channel(`match:${roomCode}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'multiplayer_matches',
        filter: `room_code=eq.${roomCode}`
      }, (payload) => {
        console.log('Match updated:', payload);
        if (payload.eventType === 'UPDATE') {
          setMatch(payload.new);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_participants'
      }, (payload) => {
        console.log('Participant updated:', payload);
        fetchParticipants(match?.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  };

  const createMatch = async (mode: string, roomName: string, maxPlayers: number) => {
    if (!user) {
      toast.error('You must be logged in');
      return null;
    }

    setLoading(true);
    
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data: matchData, error: matchError } = await supabase
      .from('multiplayer_matches')
      .insert({
        room_code: roomCode,
        room_name: roomName,
        mode,
        max_players: maxPlayers,
        created_by: user.id,
        current_players: 1
      })
      .select()
      .single();

    if (matchError) {
      console.error('Error creating match:', matchError);
      toast.error('Failed to create match');
      setLoading(false);
      return null;
    }

    // Add creator as participant
    await supabase
      .from('match_participants')
      .insert({
        match_id: matchData.id,
        user_id: user.id
      });

    setMatch(matchData);
    setLoading(false);
    toast.success(`Room created: ${roomCode}`);
    return matchData;
  };

  const joinMatch = async (code: string) => {
    if (!user) {
      toast.error('You must be logged in');
      return false;
    }

    setLoading(true);

    const { data: matchData, error: matchError } = await supabase
      .from('multiplayer_matches')
      .select('*')
      .eq('room_code', code.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (matchError || !matchData) {
      toast.error('Room not found or already started');
      setLoading(false);
      return false;
    }

    if (matchData.current_players >= matchData.max_players) {
      toast.error('Room is full');
      setLoading(false);
      return false;
    }

    const { error: participantError } = await supabase
      .from('match_participants')
      .insert({
        match_id: matchData.id,
        user_id: user.id
      });

    if (participantError) {
      toast.error('Failed to join room');
      setLoading(false);
      return false;
    }

    await supabase
      .from('multiplayer_matches')
      .update({ current_players: matchData.current_players + 1 })
      .eq('id', matchData.id);

    setMatch(matchData);
    setLoading(false);
    toast.success('Joined room successfully');
    return true;
  };

  const leaveMatch = async () => {
    if (!user || !match) return;

    await supabase
      .from('match_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('match_id', match.id)
      .eq('user_id', user.id);

    await supabase
      .from('multiplayer_matches')
      .update({ current_players: match.current_players - 1 })
      .eq('id', match.id);

    setMatch(null);
    setParticipants([]);
  };

  const startMatch = async () => {
    if (!match || !user) return;

    if (match.created_by !== user.id) {
      toast.error('Only the host can start the match');
      return;
    }

    await supabase
      .from('multiplayer_matches')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', match.id);

    toast.success('Match started!');
  };

  return {
    match,
    participants,
    loading,
    createMatch,
    joinMatch,
    leaveMatch,
    startMatch
  };
};