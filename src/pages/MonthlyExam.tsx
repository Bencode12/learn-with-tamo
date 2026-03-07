import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, BookOpen, CheckCircle, XCircle, Target, TrendingUp, 
  Loader2, ArrowLeft, ArrowRight, Play, Trophy, AlertTriangle 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  subject: string;
  difficulty: string;
}

interface ExamAttempt {
  id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  subject_breakdown: Record<string, { correct: number; total: number }> | null;
}

const SUBJECTS = [
  { id: "math", name: "Mathematics", icon: "📐" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "history", name: "History", icon: "📜" },
  { id: "languages", name: "Languages", icon: "🌍" },
  { id: "programming", name: "Programming", icon: "💻" },
  { id: "mixed", name: "Mixed (All Subjects)", icon: "🎯" },
];

const MonthlyExam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Setup state
  const [phase, setPhase] = useState<"setup" | "exam" | "results">("setup");
  const [selectedSubject, setSelectedSubject] = useState("mixed");
  const [questionCount, setQuestionCount] = useState("20");
  const [timeLimit, setTimeLimit] = useState("30");

  // Exam state
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  // Results
  const [examResult, setExamResult] = useState<{
    score: number;
    total: number;
    timeTaken: number;
    subjectBreakdown: Record<string, { correct: number; total: number }>;
  } | null>(null);

  // Past attempts
  const [pastAttempts, setPastAttempts] = useState<ExamAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    if (user) fetchPastAttempts();
  }, [user]);

  // Timer
  useEffect(() => {
    if (phase !== "exam" || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  const fetchPastAttempts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10);
    setPastAttempts((data || []) as unknown as ExamAttempt[]);
    setLoadingAttempts(false);
  };

  const startExam = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          action: 'generate_exam',
          subject: selectedSubject,
          questionCount: parseInt(questionCount),
          difficulty: 'mixed',
        }
      });

      if (error) throw error;

      const examQuestions = data.questions || data.lesson?.quiz || [];
      if (examQuestions.length === 0) throw new Error("No questions generated");

      const formattedQuestions: ExamQuestion[] = examQuestions.map((q: any, i: number) => ({
        id: i,
        question: typeof q.question === 'string' ? q.question : JSON.stringify(q.question),
        options: (q.options || []).map((o: any) => typeof o === 'string' ? o : JSON.stringify(o)),
        correct: typeof q.correct === 'number' ? q.correct : 0,
        subject: q.subject || selectedSubject,
        difficulty: q.difficulty || 'medium',
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestion(0);
      setAnswers({});
      setStartTime(Date.now());
      setTimeRemaining(parseInt(timeLimit) * 60);
      setPhase("exam");
    } catch (e: any) {
      toast.error("Failed to generate exam: " + (e.message || "Unknown error"));
    }
    setLoading(false);
  };

  const submitExam = useCallback(async () => {
    if (questions.length === 0) return;

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    let correct = 0;
    const subjectBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q, i) => {
      const subj = q.subject || "general";
      if (!subjectBreakdown[subj]) subjectBreakdown[subj] = { correct: 0, total: 0 };
      subjectBreakdown[subj].total++;
      if (answers[i] === q.correct) {
        correct++;
        subjectBreakdown[subj].correct++;
      }
    });

    setExamResult({
      score: correct,
      total: questions.length,
      timeTaken,
      subjectBreakdown,
    });

    // Save to database - find or create an exam record
    try {
      // Get current month for exam grouping
      const now = new Date();
      const examMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      await supabase.from('exam_results').insert({
        user_id: user!.id,
        exam_month: examMonth,
        subjects: subjectBreakdown as any,
        total_score: correct,
        max_score: questions.length,
        percentage: Math.round((correct / questions.length) * 100),
      });

      // Update XP
      const xpGained = Math.round((correct / questions.length) * 50) + 20;
      const { data: profile } = await supabase
        .from('profiles')
        .select('experience')
        .eq('id', user!.id)
        .single();
      if (profile) {
        await supabase.from('profiles').update({
          experience: (profile.experience || 0) + xpGained,
        }).eq('id', user!.id);
      }
    } catch (e) {
      console.error('Failed to save exam result:', e);
    }

    setPhase("results");
  }, [questions, answers, startTime, user]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const percentage = examResult ? Math.round((examResult.score / examResult.total) * 100) : 0;

  // ========== EXAM PHASE ==========
  if (phase === "exam" && questions.length > 0) {
    const q = questions[currentQuestion];
    const answered = Object.keys(answers).length;
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{currentQuestion + 1}/{questions.length}</Badge>
              <Progress value={progress} className="w-32 h-2" />
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 text-sm font-mono ${timeRemaining < 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
              <Badge variant="secondary">{answered} answered</Badge>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                <Badge variant="secondary" className="text-xs">{q.difficulty}</Badge>
              </div>
              <CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion]: parseInt(val) }))}
                className="space-y-3"
              >
                {q.options.map((option, i) => (
                  <div key={i} className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    answers[currentQuestion] === i ? 'border-foreground bg-foreground/5' : 'border-border/40 hover:bg-muted/50'
                  }`}>
                    <RadioGroupItem value={i.toString()} id={`q${currentQuestion}_o${i}`} />
                    <Label htmlFor={`q${currentQuestion}_o${i}`} className="flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestion(c => c - 1)} 
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />Previous
                </Button>
                {currentQuestion < questions.length - 1 ? (
                  <Button onClick={() => setCurrentQuestion(c => c + 1)}>
                    Next<ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={submitExam}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    Submit Exam
                  </Button>
                )}
              </div>

              {/* Question nav dots */}
              <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      i === currentQuestion 
                        ? 'bg-foreground text-background' 
                        : answers[i] !== undefined 
                        ? 'bg-foreground/20 text-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ========== RESULTS PHASE ==========
  if (phase === "results" && examResult) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
            <Link to="/exams">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back to Exams</Button>
            </Link>
            <Badge>Monthly Exam Results</Badge>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              percentage >= 70 ? "bg-foreground/10" : percentage >= 50 ? "bg-muted" : "bg-destructive/10"
            }`}>
              {percentage >= 70 
                ? <Trophy className="h-10 w-10 text-foreground" />
                : percentage >= 50
                ? <Target className="h-10 w-10 text-muted-foreground" />
                : <AlertTriangle className="h-10 w-10 text-destructive" />
              }
            </div>
            <h2 className="text-3xl font-bold">
              {percentage >= 90 ? "Outstanding!" : percentage >= 70 ? "Well Done!" : percentage >= 50 ? "Good Effort!" : "Keep Practicing"}
            </h2>
            <div className="text-5xl font-black text-foreground">{percentage}%</div>
            <p className="text-muted-foreground">
              {examResult.score}/{examResult.total} correct in {formatTime(examResult.timeTaken)}
            </p>
          </div>

          {/* Subject breakdown */}
          <Card className="border-border/40">
            <CardHeader><CardTitle className="text-lg">Subject Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(examResult.subjectBreakdown).map(([subject, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={subject} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{subject}</span>
                      <span className="text-sm text-muted-foreground">{data.correct}/{data.total} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Question review */}
          <Card className="border-border/40">
            <CardHeader><CardTitle className="text-lg">Question Review</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.correct;
                return (
                  <div key={i} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{q.question}</p>
                        {!isCorrect && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Your answer: {q.options[answers[i]] || "Not answered"} → Correct: {q.options[q.correct]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link to="/exams" className="flex-1">
              <Button variant="outline" className="w-full">Back to Exams</Button>
            </Link>
            <Button onClick={() => { setPhase("setup"); setExamResult(null); }} className="flex-1">
              Take Another Exam
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ========== SETUP PHASE ==========
  return (
    <AppLayout title="Monthly Examination" subtitle="Test your knowledge across all subjects">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Configure Your Exam
              </CardTitle>
              <CardDescription>Customize your monthly examination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <Label className="font-medium">Subject</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUBJECTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubject(s.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedSubject === s.id
                          ? 'border-foreground bg-foreground/5'
                          : 'border-border/40 hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <p className="text-sm font-medium mt-1">{s.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div className="space-y-2">
                <Label className="font-medium">Number of Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                    <SelectItem value="30">30 Questions</SelectItem>
                    <SelectItem value="50">50 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time limit */}
              <div className="space-y-2">
                <Label className="font-medium">Time Limit</Label>
                <Select value={timeLimit} onValueChange={setTimeLimit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={startExam} 
                disabled={loading}
                className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                {loading ? "Generating Exam..." : "Start Exam"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Past Results */}
        <div className="space-y-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Past Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAttempts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : pastAttempts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No exams taken yet</p>
              ) : (
                <div className="space-y-3">
                  {pastAttempts.map(attempt => {
                    const pct = Math.round((attempt.score / attempt.total_questions) * 100);
                    return (
                      <div key={attempt.id} className="p-3 rounded-lg border border-border/40 bg-muted/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{pct}%</p>
                            <p className="text-xs text-muted-foreground">
                              {attempt.score}/{attempt.total_questions} • {formatTime(attempt.time_taken_seconds)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default MonthlyExam;
