
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, RefreshCw, Play, Target, Users, Zap, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Dashboard = () => {
  const [grades, setGrades] = useState([
    { subject: "Mathematics", grade: 85, trend: "up" },
    { subject: "Science", grade: 78, trend: "down" },
    { subject: "English", grade: 92, trend: "up" },
    { subject: "History", grade: 80, trend: "stable" }
  ]);

  const [selectedLesson, setSelectedLesson] = useState("");
  
  const lessons = [
    { id: "algebra", name: "Algebra Basics", subject: "Mathematics" },
    { id: "geometry", name: "Geometry Fundamentals", subject: "Mathematics" },
    { id: "scientific-method", name: "Scientific Method", subject: "Science" },
    { id: "chemistry-basics", name: "Chemistry Basics", subject: "Science" },
    { id: "essay-writing", name: "Essay Writing", subject: "English" },
    { id: "wwii", name: "World War II", subject: "History" }
  ];

  const getAISuggestions = (lessonId: string) => {
    const suggestions: Record<string, string[]> = {
      algebra: [
        "Start with linear equations - they form the foundation",
        "Practice solving for x in different scenarios",
        "Try 15 minutes daily for consistent improvement"
      ],
      geometry: [
        "Focus on understanding angle relationships",
        "Draw diagrams to visualize problems",
        "Review Pythagorean theorem applications"
      ],
      "scientific-method": [
        "Break down experiments into clear steps",
        "Practice forming testable hypotheses",
        "Learn to identify variables in experiments"
      ],
      "chemistry-basics": [
        "Master the periodic table layout first",
        "Understand atomic structure concepts",
        "Practice balancing chemical equations"
      ],
      "essay-writing": [
        "Create strong thesis statements",
        "Use the PEEL paragraph structure",
        "Read example essays for inspiration"
      ],
      wwii: [
        "Study the timeline of major events",
        "Understand the causes and consequences",
        "Focus on key turning points"
      ]
    };
    return suggestions[lessonId] || ["Select a lesson to see AI recommendations"];
  };

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
      <Header showIcons={true} />

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
              <CardTitle>AI Learning Assistant</CardTitle>
              <CardDescription>Personalized AI recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grades.map((grade, index) => {
                  const lessonForSubject = lessons.find(l => l.subject === grade.subject);
                  const suggestions = lessonForSubject ? getAISuggestions(lessonForSubject.id) : ["Focus on improving your understanding of core concepts"];
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{grade.subject}</span>
                        <Badge variant={grade.grade >= 85 ? "default" : grade.grade >= 70 ? "secondary" : "destructive"}>
                          {grade.grade}%
                        </Badge>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-400">
                        <p className="text-sm text-gray-700">{suggestions[0]}</p>
                      </div>
                    </div>
                  );
                })}
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
              <Link to="/game-modes">
                <Button className="h-20 flex-col space-y-2 w-full bg-blue-600 hover:bg-blue-700">
                  <Play className="h-6 w-6" />
                  <span>Start AI Tutoring</span>
                </Button>
              </Link>
              
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
