import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Clock, BookOpen, Target, Star, Trophy, LineChart, BarChart3, PieChart, ArrowLeft, Heart, Brain, MessageCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PDFExport } from "@/components/PDFExport";
import { useLanguage } from "@/contexts/LanguageContext";

interface LessonProgress {
  id: string;
  subject_id: string;
  chapter_id: string;
  lesson_id: string;
  completed: boolean;
  score: number | null;
  time_spent: number;
  last_accessed: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

interface WellnessCheckin {
  id: string;
  mood_rating: number | null;
  stress_level: number | null;
  notes: string | null;
  ai_response: string | null;
  created_at: string;
}

const Progress = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPremium, setIsPremium] = useState(false);
  const [lessonsProgress, setLessonsProgress] = useState<LessonProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [wellnessCheckins, setWellnessCheckins] = useState<WellnessCheckin[]>([]);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    averageScore: 0,
    totalHours: 0,
    currentStreak: 7,
    level: 1,
    xp: 0,
    nextLevelXp: 1000
  });

  useEffect(() => {
    if (!user) return;
    fetchProgress();
    fetchWellnessCheckins();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false });

    if (progress) {
      setLessonsProgress(progress);
      const completed = progress.filter(p => p.completed).length;
      const avgScore = progress.length > 0 
        ? progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length 
        : 0;
      const totalMinutes = progress.reduce((sum, p) => sum + p.time_spent, 0);

      setStats(prev => ({
        ...prev,
        totalLessons: progress.length,
        completedLessons: completed,
        averageScore: Math.round(avgScore),
        totalHours: Math.round(totalMinutes / 60)
      }));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('experience, level, is_premium')
      .eq('id', user.id)
      .single();

    if (profile) {
      setStats(prev => ({
        ...prev,
        level: profile.level,
        xp: profile.experience,
        nextLevelXp: profile.level * 1000
      }));
      setIsPremium(profile.is_premium || false);
    }

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select(`earned_at, achievements (id, name, description, icon)`)
      .eq('user_id', user.id);

    if (userAchievements) {
      const achievementsData = userAchievements.map((ua: any) => ({
        ...ua.achievements,
        earned_at: ua.earned_at
      }));
      setAchievements(achievementsData);
    }
  };

  const fetchWellnessCheckins = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('therapist_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setWellnessCheckins(data);
    }
  };

  const getSubjectIcon = (subjectId: string) => {
    const icons: Record<string, string> = { math: "📊", science: "🔬", language: "📝", social: "📚" };
    return icons[subjectId] || "📖";
  };

  const getMoodEmoji = (rating: number | null) => {
    if (!rating) return "😐";
    if (rating <= 2) return "😞";
    if (rating <= 3) return "😐";
    if (rating <= 4) return "🙂";
    return "😄";
  };

  const getStressEmoji = (level: number | null) => {
    if (!level) return "😐";
    if (level <= 2) return "😌";
    if (level <= 3) return "😐";
    if (level <= 4) return "😰";
    return "😫";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const daysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backTo')} Dashboard
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <PDFExport type="all" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">{t('progress')}</h2>
          <p className="text-muted-foreground">{t('trackJourney')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('level')}</CardTitle>
              <Trophy className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.level}</div>
              <ProgressBar value={(stats.xp / stats.nextLevelXp) * 100} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{stats.xp} / {stats.nextLevelXp} XP</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('completed')}</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedLessons}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('outOf')} {stats.totalLessons} {t('lessons')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('avgScore')}</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">{t('acrossQuizzes')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('studyTime')}</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours}h</div>
              <p className="text-xs text-muted-foreground mt-1">{t('totalLearningTime')}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={searchParams.get('tab') || 'lessons'} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
            <TabsTrigger value="lessons">{t('lessons')}</TabsTrigger>
            <TabsTrigger value="trends">{t('trends')}</TabsTrigger>
            <TabsTrigger value="achievements">{t('achievements')}</TabsTrigger>
            <TabsTrigger value="wellness">{t('wellness')}</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{t('recentActivity')}</span>
                </CardTitle>
                <CardDescription>{t('recentlyAccessed')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessonsProgress.slice(0, 10).map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getSubjectIcon(lesson.subject_id)}</div>
                        <div>
                          <h4 className="font-semibold capitalize">{lesson.lesson_id.replace(/-/g, ' ')}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{lesson.subject_id} • {lesson.chapter_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {lesson.completed ? (
                            <>
                              <Badge variant="default" className="mb-1">Completed</Badge>
                              <p className="text-sm text-muted-foreground">Score: {lesson.score}%</p>
                            </>
                          ) : (
                            <Badge variant="secondary">In Progress</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {lesson.time_spent}m
                        </div>
                      </div>
                    </div>
                  ))}
                  {lessonsProgress.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No lessons started yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5" />
                    <span>{t('weeklyProgress')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {[65, 78, 45, 88, 92, 75, 85].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t" style={{ height: `${height}%` }} />
                        <span className="text-xs text-muted-foreground mt-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{t('subjectPerformance')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { subject: 'Math', score: 85, color: 'bg-blue-500' },
                    { subject: 'Science', score: 78, color: 'bg-green-500' },
                    { subject: 'Language', score: 92, color: 'bg-purple-500' },
                    { subject: 'Social', score: 88, color: 'bg-orange-500' }
                  ].map((item) => (
                    <div key={item.subject}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.subject}</span>
                        <span className="text-sm text-muted-foreground">{item.score}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>{t('achievements')}</span>
                </CardTitle>
                <CardDescription>{achievements.length} {t('achievementsUnlocked')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 rounded-lg border bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold mb-1">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <div className="col-span-3 text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No achievements yet. Keep learning!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>{t('wellnessCheckins')}</span>
                </CardTitle>
                <CardDescription>Your mental health and wellness journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {wellnessCheckins.length > 0 ? (
                    wellnessCheckins.map((checkin) => (
                      <div key={checkin.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getMoodEmoji(checkin.mood_rating)}</span>
                              <span className="text-sm font-medium">{t('mood')}: {checkin.mood_rating}/5</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getStressEmoji(checkin.stress_level)}</span>
                              <span className="text-sm font-medium">{t('stress')}: {checkin.stress_level}/5</span>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(checkin.created_at)} • {daysAgo(checkin.created_at)} days ago
                          </span>
                        </div>
                        
                        {checkin.notes && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {t('notes')}
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{checkin.notes}</p>
                          </div>
                        )}
                        
                        {checkin.ai_response && (
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center">
                              <Brain className="h-4 w-4 mr-1 text-purple-500" />
                              {t('aiInsights')}
                            </h4>
                            <div className="text-sm text-muted-foreground bg-purple-50 p-2 rounded border border-purple-200">
                              {checkin.ai_response}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t('noCheckinsYet')}</h3>
                      <p className="text-muted-foreground mb-4">Complete your first wellness check-in to track your mental health journey</p>
                      <Link to="/dashboard">
                        <Button>Go to Dashboard</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Progress;