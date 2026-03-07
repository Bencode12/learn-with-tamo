import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Clock, CheckCircle, XCircle, Target, TrendingUp,
  Loader2, ArrowLeft, ArrowRight, Trophy, AlertTriangle, Play, BookOpen, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  subject: string;
  difficulty: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Exams = () => {
  const { user } = useAuth();

  const [phase, setPhase] = useState<'loading' | 'list' | 'exam' | 'results'>('loading');
  const [hasActivityThisMonth, setHasActivityThisMonth] = useState(false);
  const [alreadyTakenThisMonth, setAlreadyTakenThisMonth] = useState(false);
  const [lessonsThisMonth, setLessonsThisMonth] = useState(0);
  const [studiedSubjects, setStudiedSubjects] = useState<string[]>([]);

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
    percentage: number;
    subjectBreakdown: Record<string, { correct: number; total: number }>;
    planAdjustments: { planName: string; action: string }[];
  } | null>(null);

  // Past results
  const [pastResults, setPastResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam' || timeRemaining <= 0) return;
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

  const loadData = async () => {
    if (!user) return;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const examMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const [progressRes, resultsRes, thisMonthRes] = await Promise.all([
      supabase
        .from('lesson_progress')
        .select('subject_id, plan_id, completed')
        .eq('user_id', user.id)
        .gte('last_accessed', monthStart),
      supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10),
      supabase
        .from('exam_results')
        .select('id')
        .eq('user_id', user.id)
        .eq('exam_month', examMonth)
        .limit(1),
    ]);

    const progress = progressRes.data || [];
    const subjects = [...new Set(progress.map(p => p.subject_id))];
    const completed = progress.filter(p => p.completed).length;

    setLessonsThisMonth(completed);
    setStudiedSubjects(subjects);
    setHasActivityThisMonth(completed > 0);
    setAlreadyTakenThisMonth((thisMonthRes.data || []).length > 0);
    setPastResults(resultsRes.data || []);
    setPhase('list');
  };

  const startExam = async () => {
    setLoading(true);
    try {
      const questionCount = Math.min(Math.max(lessonsThisMonth * 2, 10), 30);
      const subjectList = studiedSubjects.join(', ');

      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          action: 'generate_exam',
          subject: 'mixed',
          questionCount,
          difficulty: 'mixed',
          context: `Generate questions ONLY about these subjects the student studied this month: ${subjectList}. Weight more questions toward weaker areas.`,
        }
      });

      if (error) throw error;

      const examQuestions = data.questions || data.lesson?.quiz || [];
      if (examQuestions.length === 0) throw new Error('No questions generated');

      const formatted: ExamQuestion[] = examQuestions.map((q: any, i: number) => ({
        id: i,
        question: typeof q.question === 'string' ? q.question : JSON.stringify(q.question),
        options: (q.options || []).map((o: any) => typeof o === 'string' ? o : JSON.stringify(o)),
        correct: typeof q.correct === 'number' ? q.correct : 0,
        subject: q.subject || 'general',
        difficulty: q.difficulty || 'medium',
      }));

      setQuestions(formatted);
      setCurrentQuestion(0);
      setAnswers({});
      setStartTime(Date.now());
      setTimeRemaining(formatted.length * 60);
      setPhase('exam');
    } catch (e: any) {
      toast.error('Failed to generate exam: ' + (e.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const submitExam = useCallback(async () => {
    if (questions.length === 0) return;

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    let correct = 0;
    const subjectBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q, i) => {
      const subj = q.subject || 'general';
      if (!subjectBreakdown[subj]) subjectBreakdown[subj] = { correct: 0, total: 0 };
      subjectBreakdown[subj].total++;
      if (answers[i] === q.correct) {
        correct++;
        subjectBreakdown[subj].correct++;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    const planAdjustments: { planName: string; action: string }[] = [];

    try {
      // Adjust learning plans
      const { data: activePlans } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active');

      if (activePlans) {
        for (const plan of activePlans) {
          let action = 'On track — no changes';
          const updates: any = {};

          if (percentage >= 85) {
            const newDuration = Math.max(1, plan.duration_months - 1);
            if (newDuration !== plan.duration_months) {
              updates.duration_months = newDuration;
              action = `Shortened to ${newDuration} month${newDuration > 1 ? 's' : ''}`;
            }
          } else if (percentage < 50) {
            updates.duration_months = plan.duration_months + 1;
            action = `Extended to ${plan.duration_months + 1} months`;
          }

          if (Object.keys(updates).length > 0) {
            await supabase.from('learning_plans').update(updates).eq('id', plan.id);
          }
          planAdjustments.push({ planName: plan.name, action });
        }
      }

      // Save result
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

      // Send exam results email
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user!.id)
          .single();

        await supabase.functions.invoke('send-email', {
          body: {
            type: 'exam_results',
            user_id: user!.id,
            subject: `Monthly Exam Results — ${percentage}%`,
            data: {
              username: userProfile?.username || 'Student',
              exam_title: `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()} Examination`,
              score: correct,
              total_questions: questions.length,
              percentage,
              time_taken: timeTaken,
              subject_breakdown: subjectBreakdown,
            }
          }
        });
      } catch {
        // Email send is best-effort
      }
    } catch (e) {
      console.error('Failed to save exam result:', e);
    }

    setExamResult({ score: correct, total: questions.length, timeTaken, percentage, subjectBreakdown, planAdjustments });
    setPhase('results');
  }, [questions, answers, startTime, user]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const now = new Date();
  const currentMonthName = MONTH_NAMES[now.getMonth()];
  const currentYear = now.getFullYear();

  // ========== EXAM PHASE ==========
  if (phase === 'exam' && questions.length > 0) {
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
                <Button variant="outline" onClick={() => setCurrentQuestion(c => c - 1)} disabled={currentQuestion === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" />Previous
                </Button>
                {currentQuestion < questions.length - 1 ? (
                  <Button onClick={() => setCurrentQuestion(c => c + 1)}>
                    Next<ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={submitExam} className="bg-foreground text-background hover:bg-foreground/90">
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
  if (phase === 'results' && examResult) {
    return (
      <AppLayout title="Exam Results" subtitle={`${currentMonthName} ${currentYear} Examination`}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              examResult.percentage >= 70 ? 'bg-foreground/10' : examResult.percentage >= 50 ? 'bg-muted' : 'bg-destructive/10'
            }`}>
              {examResult.percentage >= 70
                ? <Trophy className="h-10 w-10 text-foreground" />
                : examResult.percentage >= 50
                ? <Target className="h-10 w-10 text-muted-foreground" />
                : <AlertTriangle className="h-10 w-10 text-destructive" />
              }
            </div>
            <h2 className="text-3xl font-bold">
              {examResult.percentage >= 90 ? 'Outstanding!' : examResult.percentage >= 70 ? 'Well Done!' : examResult.percentage >= 50 ? 'Good Effort!' : 'Keep Practicing'}
            </h2>
            <div className="text-5xl font-black text-foreground">{examResult.percentage}%</div>
            <p className="text-muted-foreground">
              {examResult.score}/{examResult.total} correct in {formatTime(examResult.timeTaken)}
            </p>
            <p className="text-xs text-muted-foreground">Detailed results have been sent to your email</p>
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
                            Your answer: {q.options[answers[i]] || 'Not answered'} → Correct: {q.options[q.correct]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button onClick={() => { setPhase('list'); setExamResult(null); loadData(); }} className="w-full">
            Back to Exams
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ========== LIST PHASE ==========
  return (
    <AppLayout title="Examinations" subtitle="Monthly exams based on your learning activity">
      <div className="max-w-2xl mx-auto space-y-6">
        {phase === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Current month exam */}
            <Card className="border-border/40">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{currentMonthName} — Examination</h3>
                      <p className="text-sm text-muted-foreground">
                        {!hasActivityThisMonth
                          ? 'Complete lessons to unlock'
                          : alreadyTakenThisMonth
                          ? 'Completed this month'
                          : `${lessonsThisMonth} lessons studied`
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={startExam}
                    disabled={!hasActivityThisMonth || alreadyTakenThisMonth || loading}
                    className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {alreadyTakenThisMonth ? 'Done' : 'Start'}
                  </Button>
                </div>
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
                  {pastResults.map((result: any) => {
                    const date = new Date(result.exam_month);
                    const monthLabel = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
                    return (
                      <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{monthLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.total_score}/{result.max_score} correct
                          </p>
                        </div>
                        <Badge variant={result.percentage >= 70 ? 'default' : result.percentage >= 50 ? 'secondary' : 'destructive'}>
                          {result.percentage}%
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {!hasActivityThisMonth && (
              <Card className="border-border/40">
                <CardContent className="text-center py-12 space-y-3">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Complete lessons this month to unlock your examination</p>
                  <Link to="/program-learning">
                    <Button variant="outline" size="sm">Start Learning</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Exams;
