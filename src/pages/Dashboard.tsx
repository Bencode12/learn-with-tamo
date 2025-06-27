
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, TrendingUp, Settings, User, LogOut, RefreshCw, Trophy } from "lucide-react";
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

  const handleSyncGrades = () => {
    // TODO: Implement TamoAPI grade sync
    console.log("Syncing grades from TamoAPI...");
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
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex-col space-y-2">
                <Brain className="h-6 w-6" />
                <span>Start AI Tutoring</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BookOpen className="h-6 w-6" />
                <span>Review Materials</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
