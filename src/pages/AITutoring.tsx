import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Video, FileText, Send, Play, Pause, Settings, LogOut, MessageSquare, Trophy, Users, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const AITutoring = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [showGameModeSelection, setShowGameModeSelection] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedField, setSelectedField] = useState("");
  
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "ai",
      message: "Hello! I'm your AI tutor. I'm here to help you with today's math lesson on quadratic equations. What would you like to know?"
    },
    {
      id: 2,
      type: "user",
      message: "Can you explain what a quadratic equation is?"
    },
    {
      id: 3,
      type: "ai",
      message: "A quadratic equation is a polynomial equation of degree 2. It has the general form ax² + bx + c = 0, where 'a', 'b', and 'c' are constants and 'a' ≠ 0. The graph of a quadratic equation is always a parabola."
    }
  ]);

  const worksheetQuestions = [
    {
      id: 1,
      question: "Solve: x² - 5x + 6 = 0",
      type: "multiple-choice",
      options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 0, 5"],
      completed: false
    },
    {
      id: 2,
      question: "What is the vertex of the parabola y = x² - 4x + 3?",
      type: "short-answer",
      completed: false
    },
    {
      id: 3,
      question: "Factor the expression: x² + 7x + 12",
      type: "short-answer",
      completed: true
    }
  ];

  const gameModes = [
    {
      id: "single",
      name: "Single Player",
      description: "Learn at your own pace with AI guidance",
      icon: Target,
      color: "bg-green-500"
    },
    {
      id: "ranked",
      name: "Ranked",
      description: "Compete against others in your skill level",
      icon: Trophy,
      color: "bg-yellow-500"
    },
    {
      id: "team",
      name: "Team",
      description: "Learn together with friends (2-4 players)",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      id: "competitive",
      name: "Competitive",
      description: "5v5 tournament-style learning battles",
      icon: Zap,
      color: "bg-red-500"
    }
  ];

  const subjects = [
    "Mathematics", "Science", "History", "Literature", "Chemistry", "Physics", "Biology", "Geography"
  ];

  const mathFields = [
    "Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry", "Linear Algebra"
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatHistory.length + 1,
        type: "user" as const,
        message: chatMessage
      };
      setChatHistory([...chatHistory, newMessage]);
      setChatMessage("");
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: chatHistory.length + 2,
          type: "ai" as const,
          message: "I understand your question. Let me help you work through this step by step..."
        };
        setChatHistory(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const startTutoring = () => {
    setShowGameModeSelection(false);
    // Here you would start the actual tutoring session
    console.log(`Starting ${selectedGameMode} mode in ${selectedSubject} - ${selectedField}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AI Tutoring</h1>
              <Badge variant="secondary">Mathematics</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Dialog open={showGameModeSelection} onOpenChange={setShowGameModeSelection}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start AI Tutoring
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Game Mode</DialogTitle>
                    <DialogDescription>
                      Choose how you want to learn today
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Game Mode Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      {gameModes.map((mode) => (
                        <Card 
                          key={mode.id} 
                          className={`cursor-pointer transition-all ${selectedGameMode === mode.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                          onClick={() => setSelectedGameMode(mode.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${mode.color} rounded-full flex items-center justify-center`}>
                                <mode.icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-medium">{mode.name}</h3>
                                <p className="text-sm text-gray-600">{mode.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Subject and Field Selection (hide for competitive mode) */}
                    {selectedGameMode && selectedGameMode !== "competitive" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Subject</label>
                          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedSubject === "Mathematics" && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Field</label>
                            <Select value={selectedField} onValueChange={setSelectedField}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a field" />
                              </SelectTrigger>
                              <SelectContent>
                                {mathFields.map((field) => (
                                  <SelectItem key={field} value={field}>{field}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedGameMode === "competitive" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">
                          <strong>Competitive Mode:</strong> Subject and field will be randomly selected by the algorithm for fair competition.
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={!selectedGameMode || (selectedGameMode !== "competitive" && (!selectedSubject || (selectedSubject === "Mathematics" && !selectedField)))}
                      onClick={startTutoring}
                    >
                      Start Learning Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Quadratic Equations Introduction</span>
                  </div>
                  <Button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    size="sm"
                  >
                    {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isVideoPlaying ? "Video is playing..." : "Click play to start the lesson"}
                    </p>
                    <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">5:32 / 15:45</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Worksheet Section */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Practice Worksheet</span>
                </CardTitle>
                <CardDescription>Complete these problems to reinforce your learning</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {worksheetQuestions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium text-gray-900">
                            Question {index + 1}. {question.question}
                          </h3>
                          {question.completed && (
                            <Badge variant="secondary" className="ml-2">Completed</Badge>
                          )}
                        </div>
                        
                        {question.type === "multiple-choice" ? (
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center space-x-2">
                                <input type="radio" name={`question-${question.id}`} className="text-blue-600" />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <Textarea
                            placeholder="Enter your answer here..."
                            className="mt-2"
                            rows={3}
                          />
                        )}
                        
                        <div className="flex justify-between items-center mt-4">
                          <Button variant="outline" size="sm">
                            Get Hint
                          </Button>
                          <Button size="sm">
                            Submit Answer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Chat */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>AI Assistant</span>
                </CardTitle>
                <CardDescription>Ask questions and get instant help</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 h-[500px]">
                  <div className="space-y-4 pr-4">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            chat.type === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{chat.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask a question..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AITutoring;
