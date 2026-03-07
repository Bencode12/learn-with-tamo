import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Clock, Target, TrendingUp, Loader2, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Ensure any value rendered as text is a string (guards against AI returning objects)
const safeString = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  return JSON.stringify(val, null, 2);
};

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
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});

  // Auto-advance flow state
  const [isStudying, setIsStudying] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0); // global lesson index across weeks
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Stats dialog
  const [statsLesson, setStatsLesson] = useState<LessonProgress | null>(null);

  const lessonsPerWeek = 3;

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

  // Determine which week/lesson corresponds to a global lesson index
  const getWeekLesson = (index: number) => {
    const weekNum = Math.floor(index / lessonsPerWeek) + 1;
    const lessonNum = (index % lessonsPerWeek) + 1;
    return { weekNum, lessonNum };
  };

  // Find the first uncompleted lesson, or the next one to advance to
  const findStartIndex = useCallback(() => {
    if (!plan) return 0;
    const weeklyPlan = (plan.weekly_plan || []) as WeekPlan[];
    const totalLessons = weeklyPlan.length * lessonsPerWeek;
    
    for (let i = 0; i < totalLessons; i++) {
      const { weekNum, lessonNum } = getWeekLesson(i);
      const lid = getLessonId(weekNum, lessonNum);
      if (!lessonProgress[lid]?.completed) return i;
    }
    return 0; // all completed, restart
  }, [plan, lessonProgress]);

  // Determine the next lesson topic based on performance
  const determineNextLessonParams = (globalIndex: number) => {
    const weeklyPlan = (plan.weekly_plan || []) as WeekPlan[];
    const { weekNum, lessonNum } = getWeekLesson(globalIndex);
    
    if (weekNum > weeklyPlan.length) {
      return null; // Plan complete
    }

    const week = weeklyPlan[weekNum - 1];
    if (!week) return null;

    let topic = week.goals[0] || week.focus;
    let field = week.focus;
    let difficulty = "intermediate";

    // Adaptive logic: if last accuracy was low, reinforce weak topics
    if (lastAccuracy !== null && lastAccuracy < 50 && weakTopics.length > 0) {
      topic = `Review: ${weakTopics[0]} (reinforcement)`;
      difficulty = "beginner";
    } else if (lastAccuracy !== null && lastAccuracy >= 90) {
      // High performance: advance to harder content or combine topics
      const goalIndex = Math.min(lessonNum - 1, week.goals.length - 1);
      topic = week.goals[goalIndex] || week.focus;
      difficulty = "advanced";
    } else {
      // Normal progression
      const goalIndex = Math.min(lessonNum - 1, week.goals.length - 1);
      topic = week.goals[goalIndex] || week.focus;
    }

    return { subject: plan.subject, field, topic, difficulty, lessonNum, weekNum };
  };

  // Start the study session - auto-finds where to begin
  const startStudySession = async () => {
    const startIdx = findStartIndex();
    setCurrentLessonIndex(startIdx);
    setIsStudying(true);
    await generateLesson(startIdx);
  };

  const generateLesson = async (globalIndex: number) => {
    setLessonLoading(true);
    setCurrentSection(0);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setShowResults(false);
    setLessonStartTime(Date.now());

    const params = determineNextLessonParams(globalIndex);
    if (!params) {
      toast.success("🎉 You've completed the entire plan!");
      setIsStudying(false);
      setLessonLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: params
      });
      if (error) throw error;
      setLessonData(data.lesson);
    } catch (e: any) {
      toast.error("Failed to generate lesson");
      setIsStudying(false);
    }
    setLessonLoading(false);
  };

  const submitQuiz = async () => {
    if (!lessonData) return;
    setQuizSubmitted(true);

    let correct = 0;
    const wrongTopics: string[] = [];
    lessonData.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) {
        correct++;
      } else {
        // Track which concepts were wrong
        wrongTopics.push(q.question.substring(0, 50));
      }
    });

    const accuracy = Math.round((correct / lessonData.quiz.length) * 100);
    const timeSpent = Math.round((Date.now() - lessonStartTime) / 1000);
    const { weekNum, lessonNum } = getWeekLesson(currentLessonIndex);
    const lessonId = getLessonId(weekNum, lessonNum);

    setLastAccuracy(accuracy);
    if (accuracy < 50) {
      setWeakTopics(prev => [...new Set([...prev, ...(lessonData?.key_concepts || [])])]);
    } else {
      // Remove mastered topics from weak list
      setWeakTopics(prev => prev.filter(t => !lessonData?.key_concepts.includes(t)));
    }

    // Save progress
    await supabase.from('lesson_progress').upsert({
      user_id: user!.id,
      subject_id: plan.id,
      chapter_id: `week_${weekNum}`,
      lesson_id: lessonId,
      completed: true,
      score: correct,
      accuracy,
      time_spent: timeSpent,
      plan_id: plan.id,
      week_number: weekNum,
      lesson_number: lessonNum,
      last_accessed: new Date().toISOString(),
    } as any, { onConflict: 'user_id,subject_id,chapter_id,lesson_id' });

    // Update skill rating
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

    setShowResults(true);
  };

  // Auto-advance to next lesson
  const continueToNext = () => {
    const nextIndex = currentLessonIndex + 1;
    setCurrentLessonIndex(nextIndex);
    generateLesson(nextIndex);
  };

  const exitStudy = () => {
    setIsStudying(false);
    setLessonData(null);
    setShowResults(false);
    loadProgress(plan.id);
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
  const totalLessons = weeklyPlan.length * lessonsPerWeek;
  const completedCount = Object.values(lessonProgress).filter(p => p.completed).length;

  // ============ STUDY SESSION VIEW ============
  if (isStudying) {
    if (lessonLoading) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {lastAccuracy !== null && lastAccuracy < 50
              ? "Generating reinforcement lesson..."
              : lastAccuracy !== null && lastAccuracy >= 90
              ? "Generating advanced content..."
              : "Generating your next lesson..."}
          </p>
        </div>
      );
    }

    if (lessonData && showResults) {
      const accuracy = lastAccuracy ?? 0;
      const { weekNum, lessonNum } = getWeekLesson(currentLessonIndex);
      
      return (
        <div className="min-h-screen bg-background">
          <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
              <Button variant="ghost" size="sm" onClick={exitStudy}>
                <ArrowLeft className="h-4 w-4 mr-2" />Exit Session
              </Button>
              <Badge variant="outline">Week {weekNum}, Lesson {lessonNum}</Badge>
            </div>
          </header>

          <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
            <div className="text-center space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                accuracy >= 70 ? "bg-green-500/10" : "bg-yellow-500/10"
              }`}>
                {accuracy >= 70 
                  ? <CheckCircle className="h-10 w-10 text-green-500" />
                  : <Target className="h-10 w-10 text-yellow-500" />
                }
              </div>
              <h2 className="text-3xl font-bold">
                {accuracy >= 90 ? "Outstanding!" : accuracy >= 70 ? "Well Done!" : accuracy >= 50 ? "Good Effort!" : "Let's Review"}
              </h2>
              <div className="text-5xl font-black text-primary">{accuracy}%</div>
              <p className="text-muted-foreground">
                {accuracy >= 90 
                  ? "Moving to more advanced content next."
                  : accuracy >= 70 
                  ? "Great progress. Continuing to the next topic."
                  : accuracy >= 50 
                  ? "Decent score. Next lesson will mix in some review."
                  : "Next lesson will reinforce these concepts before moving on."
                }
              </p>
            </div>

            {/* Performance cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-muted/30"><CardContent className="p-4 text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-xl font-bold">{accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </CardContent></Card>
              <Card className="bg-muted/30"><CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-xl font-bold">{Math.round(((Date.now() - lessonStartTime) / 1000) / 60)}m</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </CardContent></Card>
              <Card className="bg-muted/30"><CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-xl font-bold">{completedCount + 1}/{totalLessons}</div>
                <div className="text-xs text-muted-foreground">Progress</div>
              </CardContent></Card>
            </div>

            {weakTopics.length > 0 && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">Topics to reinforce:</h4>
                  <div className="flex flex-wrap gap-1">
                    {weakTopics.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={exitStudy} className="flex-1">
                Exit Session
              </Button>
              <Button onClick={continueToNext} className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </main>
        </div>
      );
    }

    if (lessonData) {
      const { weekNum, lessonNum } = getWeekLesson(currentLessonIndex);

      return (
        <div className="min-h-screen bg-background">
          <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
              <Button variant="ghost" size="sm" onClick={exitStudy}>
                <ArrowLeft className="h-4 w-4 mr-2" />Exit
              </Button>
              <span className="text-sm font-medium truncate mx-4">{lessonData.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{lessonData.title}</Badge>
                <Badge variant="secondary">{lessonData.duration_minutes}m</Badge>
              </div>
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
                        {currentSection + 1} / {lessonData.sections.length}
                      </span>
                    </div>
                    <CardTitle>{lessonData.sections[currentSection].title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {lessonData.sections[currentSection].content}
                      </ReactMarkdown>
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
                      <div className="font-medium mb-3 prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{`${qi + 1}. ${q.question}`}</ReactMarkdown></div>
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
                            <span className="text-sm flex-1"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={{p: ({children}) => <span>{children}</span>}}>{opt}</ReactMarkdown></span>
                            {quizSubmitted && oi === q.correct && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                            {quizSubmitted && quizAnswers[qi] === oi && oi !== q.correct && <XCircle className="h-4 w-4 text-destructive ml-auto" />}
                          </label>
                        ))}
                      </RadioGroup>
                      {quizSubmitted && (
                        <div className="text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{q.explanation}</ReactMarkdown></div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {!quizSubmitted ? (
                  <Button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length < lessonData.quiz.length} className="w-full">
                    Submit Quiz
                  </Button>
                ) : null}
              </div>
            )}
          </main>
        </div>
      );
    }
  }

  // ============ PLAN OVERVIEW (start screen) ============
  const avgAccuracy = completedCount > 0 
    ? Math.round(Object.values(lessonProgress).reduce((sum, p) => sum + (p.accuracy || 0), 0) / completedCount) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/game-modes">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            </Link>
            <h1 className="font-bold text-lg truncate">{plan.name}</h1>
          </div>
          <Badge variant="outline">{completedCount}/{totalLessons} lessons</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Progress overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Your Progress</h3>
              <span className="text-sm text-muted-foreground">{Math.round((completedCount / totalLessons) * 100)}%</span>
            </div>
            <Progress value={(completedCount / totalLessons) * 100} className="h-3 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{completedCount}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{avgAccuracy}%</div>
                <div className="text-xs text-muted-foreground">Avg Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{weeklyPlan.length}</div>
                <div className="text-xs text-muted-foreground">Weeks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold">Weekly Breakdown</h3>
          {weeklyPlan.map((w, i) => {
            const weekNum = i + 1;
            const weekCompleted = Array.from({ length: lessonsPerWeek }, (_, l) =>
              lessonProgress[getLessonId(weekNum, l + 1)]?.completed
            ).filter(Boolean).length;
            const weekAvg = weekCompleted > 0
              ? Math.round(Array.from({ length: lessonsPerWeek }, (_, l) => {
                  const p = lessonProgress[getLessonId(weekNum, l + 1)];
                  return p?.accuracy || 0;
                }).reduce((s, a) => s + a, 0) / lessonsPerWeek)
              : 0;

            return (
              <Card key={weekNum} className={weekCompleted === lessonsPerWeek ? "border-green-500/30" : ""}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      weekCompleted === lessonsPerWeek ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                    }`}>
                      {weekCompleted === lessonsPerWeek ? <CheckCircle className="h-4 w-4" /> : weekNum}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{w.focus}</h4>
                      <p className="text-xs text-muted-foreground">{weekCompleted}/{lessonsPerWeek} lessons</p>
                    </div>
                  </div>
                  {weekCompleted > 0 && (
                    <Badge variant="outline" className="text-xs">{weekAvg}% avg</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Start/Continue button */}
        <Button onClick={startStudySession} size="lg" className="w-full gap-2 h-14 text-lg">
          <Sparkles className="h-5 w-5" />
          {completedCount > 0 ? "Continue Studying" : "Start Learning"}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </main>
    </div>
  );
};

export default ProgramStudy;
