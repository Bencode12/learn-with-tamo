
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Video, FileText, Play, Pause, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const AITutoring = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
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
        </div>
      </main>
    </div>
  );
};

export default AITutoring;
