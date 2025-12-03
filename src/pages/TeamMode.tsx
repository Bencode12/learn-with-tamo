import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Users, Copy, ArrowLeft, MessageCircle, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "sonner";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { CollaborativeWorkspace } from "@/components/CollaborativeWorkspace";
import VoiceChat from "@/components/VoiceChat";
import { supabase } from "@/integrations/supabase/client";

const TeamMode = () => {
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);

  const { match, participants, loading, createMatch, joinMatch, leaveMatch, startMatch } = useMultiplayer(isInRoom ? roomCode : undefined);

  const allSubjects = [
    { id: "math", name: "Mathematics", icon: "📊" },
    { id: "science", name: "Science", icon: "🔬" },
    { id: "language", name: "Language Arts", icon: "📝" },
    { id: "social", name: "Social Studies", icon: "📚" }
  ];

  const chapters = {
    math: ["Algebra", "Geometry", "Calculus"],
    science: ["Physics", "Chemistry", "Biology"],
    language: ["Grammar", "Writing", "Literature"],
    social: ["History", "Geography", "Civics"]
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    const result = await createMatch("team", roomName, 6);
    if (result) {
      setRoomCode(result.room_code);
      setIsInRoom(true);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    const success = await joinMatch(roomCode);
    if (success) {
      setIsInRoom(true);
    }
  };

  const handleLeaveRoom = async () => {
    await leaveMatch();
    setIsInRoom(false);
    setShowWorkspace(false);
    setRoomCode("");
    setRoomName("");
  };

  const copyCode = () => {
    const code = match?.room_code || roomCode;
    navigator.clipboard.writeText(code);
    toast.success("Room code copied to clipboard!");
  };

  const handleStartCollaboration = async () => {
    await startMatch();
    setShowWorkspace(true);
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!match?.id) return;

    const channel = supabase
      .channel(`match:${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_participants",
          filter: `match_id=eq.${match.id}`
        },
        () => {
          // Refresh participants on change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id]);

  if (showWorkspace && match) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => setShowWorkspace(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lobby
                </Button>
                <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <VoiceChat roomCode={match.room_code} userId="current" />
                <LanguageSelector />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CollaborativeWorkspace matchId={match.id} participants={participants} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Learning Modules
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isInRoom ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Team Learning</h2>
              <p className="text-gray-600">Join or create a room to learn and collaborate with friends</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Join Room */}
              <Card>
                <CardHeader>
                  <CardTitle>Join a Room</CardTitle>
                  <CardDescription>Enter a room code to join your team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomCode">Room Code</Label>
                    <Input
                      id="roomCode"
                      placeholder="Enter 6-digit code"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={handleJoinRoom} className="w-full" disabled={loading}>
                    <Users className="h-4 w-4 mr-2" />
                    {loading ? "Joining..." : "Join Room"}
                  </Button>
                </CardContent>
              </Card>

              {/* Create Room */}
              <Card>
                <CardHeader>
                  <CardTitle>Create a Room</CardTitle>
                  <CardDescription>Start a new team learning session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      placeholder="Enter room name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateRoom} className="w-full" variant="default" disabled={loading}>
                    {loading ? "Creating..." : "Create Room"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{match?.room_name || roomName || `Room ${roomCode}`}</CardTitle>
                    <CardDescription>
                      {match?.status === "in_progress" ? "Session in progress" : "Waiting for team members to join..."}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 px-4 py-2 rounded-lg">
                      <span className="font-mono font-bold text-blue-900">{match?.room_code || roomCode}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={copyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Team Members ({participants.length}/{match?.max_players || 6})</h4>
                    <div className="flex flex-wrap gap-2">
                      {participants.map((member, idx) => (
                        <div key={member.id} className="bg-gray-100 px-3 py-2 rounded-full text-sm flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                            {(member.profiles as any)?.display_name?.charAt(0) || "U"}
                          </div>
                          {(member.profiles as any)?.display_name || `User ${idx + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Learning Path</CardTitle>
                <CardDescription>Team must agree on subject, chapter, and lesson</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Choose Subject & Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select Subject</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      {allSubjects.map((subject) => (
                        <Dialog key={subject.id}>
                          <DialogTrigger asChild>
                            <Card className="cursor-pointer hover:bg-gray-50">
                              <CardContent className="p-4 text-center">
                                <div className="text-4xl mb-2">{subject.icon}</div>
                                <h4 className="font-semibold">{subject.name}</h4>
                              </CardContent>
                            </Card>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Select Chapter - {subject.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              {chapters[subject.id as keyof typeof chapters]?.map((chapter, idx) => (
                                <Card key={idx} className="cursor-pointer hover:bg-gray-50">
                                  <CardContent className="p-4 flex items-center justify-between">
                                    <span className="font-medium">{chapter}</span>
                                    <Button size="sm">Select</Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                {participants.length >= 2 && (
                  <Button onClick={handleStartCollaboration} className="w-full" variant="default" size="lg">
                    <Bot className="h-4 w-4 mr-2" />
                    Start Collaborative Workspace
                  </Button>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" onClick={handleLeaveRoom} className="w-full">
              Leave Room
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamMode;
