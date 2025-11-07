import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceChatProps {
  roomCode: string;
  userId: string;
}

const VoiceChat = ({ roomCode, userId }: VoiceChatProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const localStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    initializeVoiceChat();
    return () => cleanup();
  }, [roomCode]);

  const initializeVoiceChat = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      localStream.current = stream;
      setIsConnected(true);
      toast.success('Voice chat connected');

      // In production, you would:
      // 1. Connect to signaling server (WebSocket)
      // 2. Exchange ICE candidates
      // 3. Create peer connections for each participant
      // 4. Handle offers/answers for WebRTC negotiation

    } catch (error) {
      console.error('Voice chat error:', error);
      toast.error('Failed to access microphone');
    }
  };

  const cleanup = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened);
    // In production: mute all remote audio tracks
  };

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Connecting voice chat...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant={isMuted ? "destructive" : "outline"}
        onClick={toggleMute}
      >
        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        variant={isDeafened ? "destructive" : "outline"}
        onClick={toggleDeafen}
      >
        {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <span className="text-sm text-green-600">Connected</span>
    </div>
  );
};

export default VoiceChat;