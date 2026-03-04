import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Clock, Target, TrendingUp, Play, Lock, Loader2, BarChart3, RefreshCw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeekPlan {
  week: number;
  focus: string;
  goals: string[];
  activities: { name: string; duration: string }[];
  hoursPerDay: string;
}

interface LessonData {
  title: string;
  description: string;
  duration_minutes: number;
  sections: { title: string; type: string; content: string }[];
  quiz: { question: string; options: string[]; correct: number; explanation: string }[];
  key_concepts: string[];
  next_steps: string;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  score: number | null;
  accuracy: number | null;
  time_spent: number;
}

const ProgramStudy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});

  // Lesson viewer state
  const [activeLesson, setActiveLesson] = useState<{ weekNum: number; lessonNum: number } | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState(0);

  // Stats dialog
  const [statsLesson, setStatsLesson] = useState<LessonProgress | null>(null);

  useEffect(() => {
    if (planId && user) loadPlan();
  }, [planId, user]);

  const loadPlan = async () => {
    const { data } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', user!.id)
      .single();

    if (data) {
      setPlan(data);
      setSelectedWeek(data.current_week || 1);
      await loadProgress(data.id);
    } else {
      toast.error("Plan not found");
      navigate("/program-learning");
    }
    setLoading(false);
  };

  const loadProgress = async (pId: string) => {
    const { data } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user!.id)
      .eq('subject_id', pId);

    if (data) {
      const map: Record<string, LessonProgress> = {};
      data.forEach(p => {
        map[p.lesson_id] = {
          lesson_id: p.lesson_id,
          completed: p.completed,
          score: p.score,
          accuracy: (p as any).accuracy ?? null,
          time_spent: p.time_spent,
        };
      });
      setLessonProgress(map);
    }
  };

  const getLessonId = (weekNum: number, lessonNum: number) => `w${weekNum}_l${lessonNum}`;

  const startLesson = async (weekNum: number, lessonNum: number) => {
    setActiveLesson({ weekNum, lessonNum });
    setLessonLoading(true);
    setCurrentSection(0);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setLessonStartTime(Date.now());

    const week = (plan.weekly_plan as WeekPlan[])[weekNum - 1];

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          subject: plan.subject,
          field: week.focus,
          topic: week.goals[0] || week.focus,
          difficulty: "intermediate",
          lessonNumber: lessonNum,
          weekNumber: weekNum,
        }
      });

      if (error) throw error;
      setLessonData(data.lesson);
    } catch (e: any) {
      toast.error("Failed to generate lesson");
      setActiveLesson(null);
    }
    setLessonLoading(false);
  };

  const submitQuiz = async () => {
    if (!lessonData || !activeLesson) return;
    setQuizSubmitted(true);

    let correct = 0;
    lessonData.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) correct++;
    });

    const accuracy = Math.round((correct / lessonData.quiz.length) * 100);
    const timeSpent = Math.round((Date.now() - lessonStartTime) / 1000);
    const lessonId = getLessonId(activeLesson.weekNum, activeLesson.lessonNum);

    // Save progress
    await supabase.from('lesson_progress').upsert({
      user_id: user!.id,
      subject_id: plan.id,
      chapter_id: `week_${activeLesson.weekNum}`,
      lesson_id: lessonId,
      completed: true,
      score: correct,
      accuracy,
      time_spent: timeSpent,
      plan_id: plan.id,
      week_number: activeLesson.weekNum,
      lesson_number: activeLesson.lessonNum,
      last_accessed: new Date().toISOString(),
    } as any, { onConflict: 'user_id,subject_id,chapter_id,lesson_id' });

    // Update skill rating (ELO-like: gain/lose based on accuracy vs expected 70%)
    const ratingChange = Math.round((accuracy - 70) * 0.5);
    const { data: profile } = await supabase.from('profiles').select('skill_rating, experience').eq('id', user!.id).single();
    if (profile) {
      const newRating = Math.max(100, (profile.skill_rating ?? 1000) + ratingChange);
      await supabase.from('profiles').update({
        skill_rating: newRating,
        experience: (profile.experience || 0) + Math.max(10, accuracy),
      }).eq('id', user!.id);
    }

    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: { lesson_id: lessonId, completed: true, score: correct, accuracy, time_spent: timeSpent }
    }));

    // If accuracy < 50%, suggest plan adaptation
    if (accuracy < 50) {
      toast.warning("Low score detected. Your plan will adapt to reinforce this topic.", { duration: 5000 });
    } else {
      toast.success(`Lesson complete! Accuracy: ${accuracy}%`);
    }
  };

  const closeLesson = () => {
    setActiveLesson(null);
    setLessonData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) return null;

  const weeklyPlan = (plan.weekly_plan || []) as WeekPlan[];
  const lessonsPerWeek = 3;

  // Lesson viewer
  if (activeLesson) {
    if (lessonLoading) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating lesson...</p>
        </div>
      );
    }

    if (lessonData) {
      return (
        <div className="min-h-screen bg-background">
          <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
              <Button variant="ghost" size="sm" onClick={closeLesson}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plan
              </Button>
              <span className="text-sm font-medium">{lessonData.title}</span>
              <Badge variant="outline">{lessonData.duration_minutes} min</Badge>
            </div>
          </header>

          <main className="max-w-3xl mx-auto px-4 py-8">
            {!showQuiz ? (
              <div className="space-y-6">
                <Progress value={((currentSection + 1) / lessonData.sections.length) * 100} className="h-2" />
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant={lessonData.sections[currentSection].type === "theory" ? "default" : "secondary"}>
                        {lessonData.sections[currentSection].type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Section {currentSection + 1} of {lessonData.sections.length}
                      </span>
                    </div>
                    <CardTitle>{lessonData.sections[currentSection].title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {lessonData.sections[currentSection].content}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentSection(s => s - 1)} disabled={currentSection === 0}>
                    Previous
                  </Button>
                  {currentSection < lessonData.sections.length - 1 ? (
                    <Button onClick={() => setCurrentSection(s => s + 1)}>Next Section</Button>
                  ) : (
                    <Button onClick={() => setShowQuiz(true)}>Take Quiz</Button>
                  )}
                </div>

                {lessonData.key_concepts.length > 0 && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">Key Concepts</h4>
                      <div className="flex flex-wrap gap-2">
                        {lessonData.key_concepts.map((c, i) => (
                          <Badge key={i} variant="outline">{c}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Quiz</h2>
                {lessonData.quiz.map((q, qi) => (
                  <Card key={qi} className={quizSubmitted ? (quizAnswers[qi] === q.correct ? "border-green-500/50" : "border-destructive/50") : ""}>
                    <CardContent className="p-5">
                      <p className="font-medium mb-3">{qi + 1}. {q.question}</p>
                      <RadioGroup
                        value={quizAnswers[qi]?.toString() || ""}
                        onValueChange={(v) => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [qi]: parseInt(v) }))}
                        className="space-y-2"
                      >
                        {q.options.map((opt, oi) => (
                          <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            quizSubmitted && oi === q.correct ? "border-green-500 bg-green-500/10" :
                            quizSubmitted && quizAnswers[qi] === oi && oi !== q.correct ? "border-destructive bg-destructive/10" :
                            quizAnswers[qi] === oi ? "border-primary bg-primary/10" : "border-border"
                          }`}>
                            <RadioGroupItem value={oi.toString()} disabled={quizSubmitted} />
                            <span className="text-sm">{opt}</span>
                            {quizSubmitted && oi === q.correct && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                            {quizSubmitted && quizAnswers[qi] === oi && oi !== q.correct && <XCircle className="h-4 w-4 text-destructive ml-auto" />}
                          </label>
                        ))}
                      </RadioGroup>
                      {quizSubmitted && (
                        <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded">{q.explanation}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {!quizSubmitted ? (
                  <Button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < lessonData.quiz.length} className="w-full">
                    Submit Quiz
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-5 text-center">
                        <div className="text-3xl font-bold mb-1">
                          {Object.values(quizAnswers).filter((a, i) => a === lessonData!.quiz[i].correct).length}/{lessonData.quiz.length}
                        </div>
                        <p className="text-muted-foreground text-sm">Correct Answers</p>
                      </CardContent>
                    </Card>
                    <Button onClick={closeLesson} className="w-full">Back to Plan</Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      );
    }
  }

  // Main plan view
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/program-learning">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            </Link>
            <h1 className="font-bold text-lg truncate">{plan.name}</h1>
          </div>
          <Badge variant="outline">Week {plan.current_week} / {weeklyPlan.length}</Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Plan overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-muted/30"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{plan.assessment_score}%</div>
            <div className="text-xs text-muted-foreground">Assessment</div>
          </CardContent></Card>
          <Card className="bg-muted/30"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{plan.fields?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Fields</div>
          </CardContent></Card>
          <Card className="bg-muted/30"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{weeklyPlan.length}</div>
            <div className="text-xs text-muted-foreground">Total Weeks</div>
          </CardContent></Card>
          <Card className="bg-muted/30"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {Object.values(lessonProgress).filter(p => p.completed).length}/{weeklyPlan.length * lessonsPerWeek}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent></Card>
        </div>

        {/* Week selector */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {weeklyPlan.map((w, i) => {
            const weekNum = i + 1;
            const completedInWeek = Array.from({ length: lessonsPerWeek }, (_, l) =>
              lessonProgress[getLessonId(weekNum, l + 1)]?.completed
            ).filter(Boolean).length;

            return (
              <Button
                key={weekNum}
                variant={selectedWeek === weekNum ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWeek(weekNum)}
                className="shrink-0 relative"
              >
                W{weekNum}
                {completedInWeek === lessonsPerWeek && (
                  <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Selected week content */}
        {selectedWeek && weeklyPlan[selectedWeek - 1] && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Week {selectedWeek}: {weeklyPlan[selectedWeek - 1].focus}
                </CardTitle>
                <CardDescription>{weeklyPlan[selectedWeek - 1].hoursPerDay}h/day recommended</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-medium mb-2">Goals</h4>
                <ul className="space-y-1 mb-4">
                  {weeklyPlan[selectedWeek - 1].goals.map((g, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Lessons */}
            <div className="grid gap-3">
              {Array.from({ length: lessonsPerWeek }, (_, i) => {
                const lessonNum = i + 1;
                const lessonId = getLessonId(selectedWeek, lessonNum);
                const progress = lessonProgress[lessonId];
                const isLocked = selectedWeek > (plan.current_week || 1) + 1;

                return (
                  <Card key={lessonNum} className={progress?.completed ? "border-green-500/30 bg-green-500/5" : ""}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          progress?.completed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                        }`}>
                          {progress?.completed ? <CheckCircle className="h-5 w-5" /> : 
                           isLocked ? <Lock className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium">Lesson {lessonNum}</h4>
                          <p className="text-sm text-muted-foreground">
                            {weeklyPlan[selectedWeek - 1].activities[i]?.name || `${weeklyPlan[selectedWeek - 1].focus} - Part ${lessonNum}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {progress?.completed && (
                          <Button variant="ghost" size="sm" onClick={() => setStatsLesson(progress)}>
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={progress?.completed ? "outline" : "default"}
                          disabled={isLocked}
                          onClick={() => startLesson(selectedWeek, lessonNum)}
                        >
                          {progress?.completed ? (
                            <><RefreshCw className="h-4 w-4 mr-1" />Redo</>
                          ) : (
                            <><Play className="h-4 w-4 mr-1" />Start</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats dialog */}
        <Dialog open={!!statsLesson} onOpenChange={() => setStatsLesson(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lesson Statistics</DialogTitle>
              <DialogDescription>Your performance on this lesson</DialogDescription>
            </DialogHeader>
            {statsLesson && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30"><CardContent className="p-4 text-center">
                  <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{statsLesson.accuracy ?? 0}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </CardContent></Card>
                <Card className="bg-muted/30"><CardContent className="p-4 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{Math.round((statsLesson.time_spent || 0) / 60)}m</div>
                  <div className="text-xs text-muted-foreground">Time Spent</div>
                </CardContent></Card>
                <Card className="bg-muted/30"><CardContent className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="text-2xl font-bold">{statsLesson.score ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Correct Answers</div>
                </CardContent></Card>
                <Card className="bg-muted/30"><CardContent className="p-4 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{(statsLesson.accuracy ?? 0) >= 70 ? "Pass" : "Needs Work"}</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </CardContent></Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ProgramStudy;
