import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Clock, CheckCircle, XCircle, Target, TrendingUp,
  Loader2, ArrowLeft, ArrowRight, Trophy, AlertTriangle, Play, BookOpen
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

interface LearningActivity {
  subject_id: string;
  plan_name: string;
  lessons_completed: number;
  avg_score: number;
  total_time: number;
}

const MonthlyExam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"loading" | "no-activity" | "ready" | "exam" | "results">("loading");
  const [learningActivity, setLearningActivity] = useState<LearningActivity[]>([]);

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
    planAdjustments: { planId: string; planName: string; action: string }[];
  } | null>(null);

  // Past results
  const [pastResults, setPastResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadMonthlyData();
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

  const loadMonthlyData = async () => {
    if (!user) return;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch this month's lesson progress + learning plans + past exam results in parallel
    const [progressRes, plansRes, resultsRes] = await Promise.all([
      supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_accessed', monthStart),
      supabase
        .from('learning_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5),
    ]);

    setPastResults(resultsRes.data || []);

    const progress = progressRes.data || [];
    const plans = plansRes.data || [];

    if (progress.length === 0) {
      setPhase("no-activity");
      return;
    }

    // Group progress by plan/subject
    const activityMap: Record<string, LearningActivity> = {};
    for (const p of progress) {
      const key = p.plan_id || p.subject_id;
      const plan = plans.find((pl: any) => pl.id === p.plan_id);
      if (!activityMap[key]) {
        activityMap[key] = {
          subject_id: p.subject_id,
          plan_name: plan?.name || p.subject_id,
          lessons_completed: 0,
          avg_score: 0,
          total_time: 0,
        };
      }
      if (p.completed) activityMap[key].lessons_completed++;
      activityMap[key].avg_score += (p.score || 0);
      activityMap[key].total_time += (p.time_spent || 0);
    }

    // Calculate averages
    const activities = Object.values(activityMap).map(a => ({
      ...a,
      avg_score: a.lessons_completed > 0 ? Math.round(a.avg_score / a.lessons_completed) : 0,
    }));

    setLearningActivity(activities);
    setPhase("ready");
  };

  const startExam = async () => {
    setLoading(true);
    try {
      // Build subject list from what user actually studied
      const subjects = learningActivity.map(a => a.plan_name).join(', ');
      const questionCount = Math.min(Math.max(learningActivity.reduce((sum, a) => sum + a.lessons_completed, 0) * 2, 10), 30);

      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          action: 'generate_exam',
          subject: 'mixed',
          questionCount,
          difficulty: 'mixed',
          context: `Generate questions ONLY about these subjects the student studied this month: ${subjects}. Weight more questions toward subjects with lower scores.`,
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
        subject: q.subject || 'general',
        difficulty: q.difficulty || 'medium',
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestion(0);
      setAnswers({});
      setStartTime(Date.now());
      // 1 minute per question
      setTimeRemaining(formattedQuestions.length * 60);
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

    const percentage = Math.round((correct / questions.length) * 100);

    // Adjust learning plans based on performance
    const planAdjustments: { planId: string; planName: string; action: string }[] = [];

    try {
      const { data: activePlans } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active');

      if (activePlans) {
        for (const plan of activePlans) {
          const planSubjectScores = learningActivity.find(
            a => a.plan_name === plan.name || a.subject_id === plan.subject
          );

          let action = 'unchanged';
          const updates: any = {};

          if (percentage >= 85 && (planSubjectScores?.avg_score || 0) >= 70) {
            // Student is excelling — shorten the plan
            const newDuration = Math.max(1, plan.duration_months - 1);
            if (newDuration !== plan.duration_months) {
              updates.duration_months = newDuration;
              action = `Shortened by 1 month (now ${newDuration}mo)`;
            } else {
              action = 'Already at minimum duration';
            }
          } else if (percentage < 50) {
            // Student is struggling — extend the plan
            updates.duration_months = plan.duration_months + 1;
            action = `Extended by 1 month (now ${plan.duration_months + 1}mo)`;
          } else {
            action = 'On track — no changes';
          }

          if (Object.keys(updates).length > 0) {
            await supabase.from('learning_plans').update(updates).eq('id', plan.id);
          }

          planAdjustments.push({ planId: plan.id, planName: plan.name, action });
        }
      }

      // Save exam result
      const now = new Date();
      const examMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      await supabase.from('exam_results').insert({
        user_id: user!.id,
        exam_month: examMonth,
        subjects: subjectBreakdown as any,
        total_score: correct,
        max_score: questions.length,
        percentage,
      });

      // Award XP
      const xpGained = Math.round(percentage * 0.5) + 20;
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

    setExamResult({
      score: correct,
      total: questions.length,
      timeTaken,
      subjectBreakdown,
      planAdjustments,
    });

    setPhase("results");
  }, [questions, answers, startTime, user, learningActivity]);

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

          {/* Plan adjustments */}
          {examResult.planAdjustments.length > 0 && (
            <Card className="border-border/40">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" />Learning Plan Impact</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {examResult.planAdjustments.map((adj, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
                    <span className="text-sm font-medium">{adj.planName}</span>
                    <Badge variant={adj.action.includes('Shortened') ? 'default' : adj.action.includes('Extended') ? 'destructive' : 'secondary'} className="text-xs">
                      {adj.action}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
                  <div key={i} className={`p-4 rounded-lg border ${isCorrect ? 'border-foreground/30 bg-foreground/5' : 'border-destructive/30 bg-destructive/5'}`}>
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
            <Link to="/progress" className="flex-1">
              <Button className="w-full">View Progress</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ========== LOADING / READY / NO-ACTIVITY ==========
  return (
    <AppLayout title="Monthly Examination" subtitle="Auto-generated based on your learning activity this month">
      <div className="max-w-2xl mx-auto space-y-6">
        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Analyzing your monthly activity...</p>
          </div>
        )}

        {phase === "no-activity" && (
          <Card className="border-border/40">
            <CardContent className="text-center py-16 space-y-4">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No Learning Activity This Month</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Complete some lessons first — the monthly exam is generated based on what you've studied.
              </p>
              <Link to="/program-learning">
                <Button className="mt-2">Start Learning</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {phase === "ready" && (
          <>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Exam is Ready
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Based on your activity this month, we've prepared an exam covering:
                </p>

                <div className="space-y-2">
                  {learningActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{activity.plan_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.lessons_completed} lessons • avg score {activity.avg_score}%
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(activity.total_time / 60)}m studied
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
                  <p>• Questions are weighted toward your weaker subjects</p>
                  <p>• Time limit: ~1 minute per question</p>
                  <p>• Results will adjust your learning plan durations</p>
                </div>

                <Button
                  onClick={startExam}
                  disabled={loading}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  {loading ? "Generating Exam..." : "Begin Monthly Exam"}
                </Button>
              </CardContent>
            </Card>

            {/* Past results */}
            {pastResults.length > 0 && (
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Past Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pastResults.map((result: any) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{result.percentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          {result.total_score}/{result.max_score} correct
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default MonthlyExam;
