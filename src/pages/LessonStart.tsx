import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PlayCircle, FileText, CheckCircle, Award, Coins, Clock, Target, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const LessonStart = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const lessonData = {
    title: searchParams.get("title") || "Introduction to Algebra",
    subject: searchParams.get("subject") || "Mathematics",
    chapter: searchParams.get("chapter") || "Algebra Basics",
    difficulty: searchParams.get("difficulty") || "Beginner",
    coins: searchParams.get("coins") || "50",
    duration: searchParams.get("duration") || "30",
    xp: searchParams.get("xp") || "100"
  };

  const lessonSteps = [
    {
      step: 1,
      name: "Video Lesson",
      description: "Watch an engaging video covering key concepts",
      icon: PlayCircle,
      duration: "10 min",
      color: "text-red-500"
    },
    {
      step: 2,
      name: "Worksheet",
      description: "Practice problems to reinforce learning",
      icon: FileText,
      duration: "12 min",
      color: "text-blue-500"
    },
    {
      step: 3,
      name: "Quiz",
      description: "Test your knowledge with interactive questions",
      icon: CheckCircle,
      duration: "8 min",
      color: "text-green-500"
    },
    {
      step: 4,
      name: "Summary & Resources",
      description: "Review materials and download PDF notes",
      icon: Award,
      duration: "5 min",
      color: "text-purple-500"
    }
  ];

  const startLesson = () => {
    navigate(`/lesson?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
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
        {/* Lesson Overview Card */}
        <Card className="mb-8 border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">{lessonData.subject}</Badge>
                  <Badge variant="outline">{lessonData.chapter}</Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{lessonData.title}</CardTitle>
                <CardDescription className="text-lg">
                  Complete this lesson to master the fundamentals and earn rewards
                </CardDescription>
              </div>
              <Badge className="bg-yellow-500 text-white">
                {lessonData.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Coins className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Reward</p>
                  <p className="text-xl font-bold text-yellow-700">+{lessonData.coins} coins</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-xl font-bold text-blue-700">{lessonData.duration} min</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">XP Gain</p>
                  <p className="text-xl font-bold text-purple-700">+{lessonData.xp} XP</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lesson Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lesson Structure</CardTitle>
            <CardDescription>Follow these steps to complete the lesson</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lessonSteps.map((step, index) => (
                <div key={step.step} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${step.color}`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-lg">
                        {step.step}. {step.name}
                      </h4>
                      <Badge variant="secondary">{step.duration}</Badge>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {index < lessonSteps.length - 1 && (
                    <div className="absolute left-9 mt-12 h-8 w-0.5 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Objectives */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Learning Objectives</CardTitle>
            <CardDescription>What you'll learn in this lesson</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Understand the fundamental concepts and principles</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Apply learned concepts to solve practical problems</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Master key techniques and methodologies</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Build confidence for advanced topics</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="w-full md:w-auto px-12 py-6 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={startLesson}
          >
            <PlayCircle className="h-6 w-6 mr-2" />
            Enter Lesson
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Ready to begin? Click to start your learning journey!
          </p>
        </div>
      </main>
    </div>
  );
};

export default LessonStart;
