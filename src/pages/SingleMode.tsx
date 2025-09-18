
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Brain, Clock, Star, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const SingleMode = () => {
  const [currentProgress] = useState(65);
  
  const subjects = [
    { id: "math", name: "Mathematics", progress: 78, lessons: 45, icon: "📊" },
    { id: "science", name: "Science", progress: 65, lessons: 32, icon: "🔬" },
    { id: "history", name: "History", progress: 82, lessons: 28, icon: "📚" },
    { id: "english", name: "English", progress: 71, lessons: 38, icon: "📝" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Learn at Your Own Pace</h2>
              <p className="text-gray-600">Master subjects with AI-powered personalized lessons</p>
            </div>
            <Badge className="bg-green-500 text-white">
              <Target className="h-4 w-4 mr-1" />
              Single Player
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Your Learning Journey</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{subject.icon}</div>
                    <div>
                      <CardTitle>{subject.name}</CardTitle>
                      <CardDescription>{subject.lessons} lessons completed</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{subject.progress}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={subject.progress} className="h-2" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>~30 min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>+50 XP</span>
                    </div>
                  </div>
                  <Link to="/ai-tutoring">
                    <Button size="sm">
                      Continue
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Challenges */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Daily Challenges</span>
            </CardTitle>
            <CardDescription>Complete these for bonus rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Math Master</h4>
                <p className="text-sm text-blue-700">Complete 3 algebra lessons</p>
                <div className="mt-2">
                  <Progress value={66} className="h-2" />
                  <p className="text-xs text-blue-600 mt-1">2/3 completed</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900">Science Explorer</h4>
                <p className="text-sm text-green-700">Study chemistry for 20 minutes</p>
                <div className="mt-2">
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-green-600 mt-1">✓ Completed</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">Perfect Score</h4>
                <p className="text-sm text-purple-700">Get 100% on any quiz</p>
                <div className="mt-2">
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-purple-600 mt-1">0/1 completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SingleMode;
