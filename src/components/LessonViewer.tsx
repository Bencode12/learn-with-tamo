import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, CheckCircle, XCircle, ArrowRight, Loader2, Brain, Target, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface LessonSection {
  title: string;
  type: "theory" | "example" | "practice";
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface LessonContent {
  title: string;
  description: string;
  duration_minutes: number;
  sections: LessonSection[];
  quiz: QuizQuestion[];
  key_concepts: string[];
  next_steps: string;
}

interface LessonViewerProps {
  subject: string;
  field: string;
  topic: string;
  difficulty: string;
  lessonNumber: number;
  weekNumber: number;
  onComplete: () => void;
  onBack: () => void;
}

export const LessonViewer = ({
  subject,
  field,
  topic,
  difficulty,
  lessonNumber,
  weekNumber,
  onComplete,
  onBack
}: LessonViewerProps) => {
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    generateLesson();
  }, [subject, field, topic]);

  const generateLesson = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lesson`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            field,
            topic,
            difficulty,
            lessonNumber,
            weekNumber
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate lesson");
      }

      const data = await response.json();
      setLesson(data.lesson);
    } catch (err) {
      console.error("Error generating lesson:", err);
      setError(err instanceof Error ? err.message : "Failed to generate lesson");
      toast.error("Failed to generate lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (!quizSubmitted) {
      setQuizAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
    }
  };

  const submitQuiz = () => {
    if (!lesson) return;
    
    let correct = 0;
    lesson.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        correct++;
      }
    });
    
    setQuizScore(Math.round((correct / lesson.quiz.length) * 100));
    setQuizSubmitted(true);
    
    if (correct >= lesson.quiz.length * 0.7) {
      toast.success(`Great job! You scored ${correct}/${lesson.quiz.length}`);
    } else {
      toast.info(`You scored ${correct}/${lesson.quiz.length}. Review the material and try again!`);
    }
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split('\n')
      .map((line, idx) => {
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-lg font-bold mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('- ')) {
          return <li key={idx} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={idx} className="font-bold my-2">{line.slice(2, -2)}</p>;
        }
        if (line.trim() === '') {
          return <br key={idx} />;
        }
        return <p key={idx} className="my-2">{line}</p>;
      });
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Generating Your Lesson</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Our AI is creating a personalized lesson on <strong>{topic}</strong> just for you...
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary">{subject}</Badge>
            <Badge variant="outline">{field}</Badge>
            <Badge>{difficulty}</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Generating Lesson</h3>
          <p className="text-muted-foreground text-center mb-4">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>Go Back</Button>
            <Button onClick={generateLesson}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lesson) return null;

  const totalSections = lesson.sections.length;
  const progress = showQuiz 
    ? (quizSubmitted ? 100 : 90) 
    : ((currentSection + 1) / totalSections) * 80;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{subject}</Badge>
                <Badge variant="outline">{field}</Badge>
                <Badge>{difficulty}</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {lesson.title}
              </CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration_minutes} min</span>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {showQuiz ? "Quiz" : `Section ${currentSection + 1} of ${totalSections}`}
          </p>
        </CardHeader>
      </Card>

      {/* Key Concepts */}
      {!showQuiz && currentSection === 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Key Concepts You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lesson.key_concepts.map((concept, idx) => (
                <Badge key={idx} variant="outline" className="bg-background">
                  {concept}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Section */}
      {!showQuiz && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant={
                lesson.sections[currentSection].type === 'theory' ? 'default' :
                lesson.sections[currentSection].type === 'example' ? 'secondary' : 'outline'
              }>
                {lesson.sections[currentSection].type}
              </Badge>
              <CardTitle className="text-xl">{lesson.sections[currentSection].title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {renderMarkdown(lesson.sections[currentSection].content)}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-6 pt-0 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => currentSection > 0 ? setCurrentSection(prev => prev - 1) : onBack()}
            >
              {currentSection > 0 ? "Previous Section" : "Back"}
            </Button>
            <Button 
              onClick={() => {
                if (currentSection < totalSections - 1) {
                  setCurrentSection(prev => prev + 1);
                } else {
                  setShowQuiz(true);
                }
              }}
            >
              {currentSection < totalSections - 1 ? "Next Section" : "Take Quiz"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Quiz Section */}
      {showQuiz && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Lesson Quiz
            </CardTitle>
            <CardDescription>
              Test your understanding of the material
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {lesson.quiz.map((q, qIdx) => (
              <div key={qIdx} className="p-4 border rounded-lg space-y-4">
                <p className="font-medium">
                  {qIdx + 1}. {q.question}
                </p>
                <RadioGroup
                  value={quizAnswers[qIdx]?.toString()}
                  onValueChange={(val) => handleQuizAnswer(qIdx, parseInt(val))}
                  disabled={quizSubmitted}
                >
                  {q.options.map((option, oIdx) => (
                    <div 
                      key={oIdx} 
                      className={`flex items-center space-x-2 p-2 rounded ${
                        quizSubmitted
                          ? oIdx === q.correct
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : quizAnswers[qIdx] === oIdx
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : ''
                          : ''
                      }`}
                    >
                      <RadioGroupItem value={oIdx.toString()} id={`q${qIdx}-o${oIdx}`} />
                      <Label htmlFor={`q${qIdx}-o${oIdx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                      {quizSubmitted && oIdx === q.correct && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {quizSubmitted && quizAnswers[qIdx] === oIdx && oIdx !== q.correct && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
                {quizSubmitted && (
                  <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
          <div className="p-6 pt-0 flex justify-between">
            <Button variant="outline" onClick={() => setShowQuiz(false)}>
              Review Material
            </Button>
            {!quizSubmitted ? (
              <Button 
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={onComplete} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Complete Lesson
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Quiz Results */}
      {quizSubmitted && (
        <Card className={quizScore >= 70 ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"}>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="text-xl font-bold">
                {quizScore >= 70 ? "🎉 Great Job!" : "📚 Keep Practicing!"}
              </h3>
              <p className="text-muted-foreground">
                You scored {quizScore}% on this quiz
              </p>
            </div>
            <div className="text-4xl font-black">
              {quizScore}%
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};