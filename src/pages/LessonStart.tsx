import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PlayCircle, FileText, CheckCircle, Award, Clock, Target, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { findLesson, lessonData } from "@/data/lessonContent";
import { useLearningTime } from "@/hooks/useLearningTime";

const LessonStart = () => {
  const { subjectId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { canLearn, formatRemainingTime, isPremium, checkAndWarn } = useLearningTime();

  // Find the lesson from our data
  const lesson = subjectId && chapterId && lessonId 
    ? findLesson(subjectId, chapterId, lessonId) 
    : null;

  // Find subject and chapter names
  const subject = lessonData.find(s => s.id === subjectId);
  const chapter = subject?.chapters.find(c => c.id === chapterId);

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
    if (!canLearn()) {
      checkAndWarn();
      return;
    }
    navigate(`/lesson/${subjectId}/${chapterId}/${lessonId}`);
  };

  const handleBack = () => {
    navigate('/single-mode');
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Lesson Not Found</CardTitle>
            <CardDescription>The requested lesson could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/single-mode')} className="w-full">Back to Lessons</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {subject?.name || 'Subjects'}
              </Button>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-foreground">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {!isPremium && (
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRemainingTime()} left today
                </Badge>
              )}

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
                  <Badge variant="secondary">{subject?.name}</Badge>
                  <Badge variant="outline">{chapter?.name}</Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{lesson.title}</CardTitle>
                <CardDescription className="text-lg">
                  Complete this lesson to master the fundamentals and earn rewards
                </CardDescription>
              </div>
              <Badge className="bg-yellow-500 text-white">
                {lesson.type === 'leetcode' ? 'Coding' : lesson.type === 'duolingo' ? 'Interactive' : 'Standard'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-xl font-bold text-blue-700">~35 min</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">XP Gain</p>
                  <p className="text-xl font-bold text-purple-700">+100 XP</p>
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
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
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
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="w-full md:w-auto px-12 py-6 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={startLesson}
            disabled={!canLearn()}
          >
            <PlayCircle className="h-6 w-6 mr-2" />
            {canLearn() ? 'Enter Lesson' : 'Daily Limit Reached'}
          </Button>
          {!canLearn() && (
            <p className="text-sm text-red-500 mt-4">
              You've used all your daily learning time. <Link to="/store" className="underline">Upgrade to Premium</Link> for unlimited access.
            </p>
          )}
          {canLearn() && (
            <p className="text-sm text-muted-foreground mt-4">
              Ready to begin? Click to start your learning journey!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonStart;
