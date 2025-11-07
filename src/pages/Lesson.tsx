import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, PlayCircle, FileText, CheckCircle, Download, ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "sonner";

const Lesson = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [worksheetAnswers, setWorksheetAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  const lessonData = {
    title: searchParams.get("title") || "Introduction to Algebra",
    subject: searchParams.get("subject") || "Mathematics",
    chapter: searchParams.get("chapter") || "Algebra Basics",
    videoId: "dQw4w9WgXcQ" // Replace with actual video ID
  };

  const worksheetProblems = [
    { id: 1, problem: "Solve for x: 2x + 5 = 15", type: "text" },
    { id: 2, problem: "Simplify: 3(x + 4) - 2x", type: "text" },
    { id: 3, problem: "What is the value of x when 5x - 3 = 17?", type: "text" }
  ];

  const quizQuestions = [
    {
      id: 1,
      question: "What is the first step in solving the equation 2x + 5 = 15?",
      options: [
        "Add 5 to both sides",
        "Subtract 5 from both sides",
        "Multiply both sides by 2",
        "Divide both sides by 2"
      ],
      correct: "Subtract 5 from both sides"
    },
    {
      id: 2,
      question: "Which property allows us to distribute 3(x + 4)?",
      options: [
        "Commutative Property",
        "Associative Property",
        "Distributive Property",
        "Identity Property"
      ],
      correct: "Distributive Property"
    },
    {
      id: 3,
      question: "What does 'solving for x' mean?",
      options: [
        "Finding any value",
        "Isolating x on one side of the equation",
        "Making the equation more complex",
        "Removing x from the equation"
      ],
      correct: "Isolating x on one side of the equation"
    }
  ];

  const steps = [
    { name: "Video", icon: PlayCircle },
    { name: "Worksheet", icon: FileText },
    { name: "Quiz", icon: CheckCircle },
    { name: "Summary", icon: Trophy }
  ];

  const handleNext = () => {
    if (currentStep === 2) {
      // Calculate quiz score
      let correct = 0;
      quizQuestions.forEach(q => {
        if (quizAnswers[q.id] === q.correct) correct++;
      });
      const percentage = Math.round((correct / quizQuestions.length) * 100);
      setScore(percentage);
      toast.success(`Quiz completed! Score: ${percentage}%`);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = () => {
    toast.success("Lesson completed! +50 coins, +100 XP");
    navigate(-1);
  };

  const handleExit = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const lessonStartUrl = `/lesson-start?${searchParams.toString()}`;
    navigate(lessonStartUrl);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleExit}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Lesson
              </Button>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <Badge 
                      variant={index === currentStep ? "default" : index < currentStep ? "secondary" : "outline"}
                      className="flex items-center space-x-1"
                    >
                      <step.icon className="h-3 w-3" />
                      <span>{step.name}</span>
                    </Badge>
                    {index < steps.length - 1 && <div className="w-4 h-0.5 bg-gray-300 mx-1" />}
                  </div>
                ))}
              </div>
              <LanguageSelector />
            </div>
          </div>
          <div className="pb-2">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Step */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{lessonData.title}</CardTitle>
              <CardDescription>Watch the video lesson to understand the core concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full mb-6">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${lessonData.videoId}`}
                  title="Lesson Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Key Points:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Pay attention to the examples demonstrated</li>
                  <li>Take notes on important formulas and concepts</li>
                  <li>Feel free to pause and replay sections as needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Worksheet Step */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Practice Worksheet</CardTitle>
              <CardDescription>Apply what you learned by solving these problems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {worksheetProblems.map((problem) => (
                  <div key={problem.id} className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-base font-semibold mb-2 block">
                      Problem {problem.id}: {problem.problem}
                    </Label>
                    <Textarea
                      placeholder="Show your work here..."
                      value={worksheetAnswers[problem.id] || ""}
                      onChange={(e) => setWorksheetAnswers({...worksheetAnswers, [problem.id]: e.target.value})}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                ))}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> Show all your steps. This helps you understand the process and makes it easier to find mistakes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Step */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Knowledge Check Quiz</CardTitle>
              <CardDescription>Test your understanding with these questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quizQuestions.map((question) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-4">
                      {question.id}. {question.question}
                    </h4>
                    <RadioGroup
                      value={quizAnswers[question.id]}
                      onValueChange={(value) => setQuizAnswers({...quizAnswers, [question.id]: value})}
                    >
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                          <Label htmlFor={`q${question.id}-${index}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Step */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Lesson Complete! 🎉</CardTitle>
              <CardDescription>Great job! Here's your summary and downloadable resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Card */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Quiz Score</h3>
                      <p className="text-gray-600">Your performance on this lesson</p>
                    </div>
                    <div className="text-4xl font-bold text-green-600">{score}%</div>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>

                {/* Rewards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Coins Earned</p>
                    <p className="text-2xl font-bold text-yellow-700">+50</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">XP Gained</p>
                    <p className="text-2xl font-bold text-purple-700">+100</p>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3">Key Takeaways:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Mastered the fundamental concepts of {lessonData.chapter}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Completed practice problems successfully</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Demonstrated understanding through quiz</span>
                    </li>
                  </ul>
                </div>

                {/* Download Resources */}
                <div>
                  <h4 className="font-semibold text-lg mb-4">Download Resources:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <Download className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-semibold">Lesson PDF</p>
                        <p className="text-xs text-gray-600">Complete notes and examples</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <Download className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-semibold">Practice Slides</p>
                        <p className="text-xs text-gray-600">Additional exercises</p>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              Complete Lesson
              <Trophy className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Lesson;
