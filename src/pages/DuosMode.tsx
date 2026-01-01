import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Users, Copy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DuosMode = () => {
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomMembers, setRoomMembers] = useState<string[]>([]);

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    return code;
  };

  const createRoom = () => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
    const code = generateRoomCode();
    setIsInRoom(true);
    setRoomMembers([code]);
    toast.success(`Room "${roomName}" created! Share code: ${code}`);
  };

  const joinRoom = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    setIsInRoom(true);
    toast.success(`Joined room: ${roomCode}`);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Room code copied to clipboard!");
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Gamemodes
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-foreground">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isInRoom ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Duos Learning</h2>
              <p className="text-muted-foreground">Join or create a room to learn with a partner (Max 2 players)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Join Room */}
              <Card>
                <CardHeader>
                  <CardTitle>Join a Room</CardTitle>
                  <CardDescription>Enter a room code to join your partner</CardDescription>
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
                  <Button onClick={joinRoom} className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Join Room
                  </Button>
                </CardContent>
              </Card>

              {/* Create Room */}
              <Card>
                <CardHeader>
                  <CardTitle>Create a Room</CardTitle>
                  <CardDescription>Start a new duos learning session</CardDescription>
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
                  <Button onClick={createRoom} className="w-full" variant="default">
                    Create Room
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
                    <CardTitle className="text-2xl">{roomName || `Room ${generatedCode || roomCode}`}</CardTitle>
                    <CardDescription>Waiting for partner to join...</CardDescription>
                  </div>
                  {generatedCode && (
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 px-4 py-2 rounded-lg">
                        <span className="font-mono font-bold text-blue-900">{generatedCode}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={copyCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Players ({roomMembers.length}/2)</h4>
                    <div className="flex flex-wrap gap-2">
                      {roomMembers.map((member, idx) => (
                        <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          Player {idx + 1}
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
                <CardDescription>Both players must agree on subject, chapter, and lesson</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setIsInRoom(false)} className="w-full">
              Leave Room
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DuosMode;
