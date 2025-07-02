
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Brain, TrendingUp, Settings, User, LogOut, RefreshCw, Trophy, Play, Target, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const Dashboard = () => {
  const [grades, setGrades] = useState([
    { subject: "Mathematics", grade: 85, trend: "up" },
    { subject: "Science", grade: 78, trend: "down" },
    { subject: "English", grade: 92, trend: "up" },
    { subject: "History", grade: 80, trend: "stable" }
  ]);

  const [aiSuggestions] = useState([
    "Focus on algebra practice to improve your math grade",
    "Review scientific method concepts in Science",
    "Great work in English! Keep up the reading habits",
    "Consider studying more about World War II events"
  ]);

  const [showGameModeSelection, setShowGameModeSelection] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedField, setSelectedField] = useState("");

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

  const handleSyncGrades = () => {
    // TODO: Implement TamoAPI grade sync
    console.log("Syncing grades from TamoAPI...");
  };

  const startTutoring = () => {
    setShowGameModeSelection(false);
    // Here you would start the actual tutoring session
    console.log(`Starting ${selectedGameMode} mode in ${selectedSubject} - ${selectedField}`);
    // Navigate to ai-tutoring with the selected options
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Learning Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link to="/leaderboard">
                <Button variant="ghost" size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's your learning progress and AI-powered recommendations.</p>
        </div>

        {/* Grades Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Current Grades</span>
                </CardTitle>
                <CardDescription>Your latest academic performance</CardDescription>
              </div>
              <Button onClick={handleSyncGrades} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {grades.map((grade, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{grade.subject}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={grade.grade >= 85 ? "default" : grade.grade >= 70 ? "secondary" : "destructive"}>
                        {grade.grade}%
                      </Badge>
                      <span className={`text-sm ${
                        grade.trend === "up" ? "text-green-600" : 
                        grade.trend === "down" ? "text-red-600" : "text-gray-600"
                      }`}>
                        {grade.trend === "up" ? "↗" : grade.trend === "down" ? "↘" : "→"}
                      </span>
                    </div>
                  </div>
                  <Progress value={grade.grade} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Recommendations</span>
              </CardTitle>
              <CardDescription>Personalized suggestions to improve your learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dialog open={showGameModeSelection} onOpenChange={setShowGameModeSelection}>
                <DialogTrigger asChild>
                  <Button className="h-20 flex-col space-y-2 w-full bg-blue-600 hover:bg-blue-700">
                    <Play className="h-6 w-6" />
                    <span>Start AI Tutoring</span>
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
              
              <Link to="/progress">
                <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Progress</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
