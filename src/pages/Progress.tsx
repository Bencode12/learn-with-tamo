import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Clock, BookOpen, Target, Star, Trophy, Heart, Brain, MessageCircle, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PDFExport } from "@/components/PDFExport";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/AppLayout";
import { JoinClassDialog } from "@/components/JoinClassDialog";
import { 
  PerformanceHeatmap, 
  RadarChart, 
  AreaChart, 
  BarChart, 
  LineChart, 
  PieChart
} from "@/components/charts";
import { useToast } from "@/hooks/use-toast";
import { GradesDashboard } from "@/components/grades";



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

interface SyncedGrade {
  id: string;
  source: string;
  subject: string;
  grade: number;
  grade_type: string;
  date: string;
  semester: string;
  teacher_name: string;
}

const Progress = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPremium, setIsPremium] = useState(false);
  const [lessonsProgress, setLessonsProgress] = useState<LessonProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [wellnessCheckins, setWellnessCheckins] = useState<WellnessCheckin[]>([]);
  const [syncedGrades, setSyncedGrades] = useState<SyncedGrade[]>([]);
  const [syncing, setSyncing] = useState(false);
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
    fetchSyncedGrades();
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

  const fetchSyncedGrades = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('synced_grades')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(50);

    if (!error && data) {
      setSyncedGrades(data as SyncedGrade[]);
    }
  };

  const syncGrades = async (source: 'tamo' | 'manodienynas') => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-grades', {
        body: { source, action: 'sync' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Grades Synced",
          description: data.message
        });
        fetchSyncedGrades();
      } else if (data.requiresSetup) {
        toast({
          title: "Setup Required",
          description: "Please save your login credentials in Settings first.",
          variant: "destructive"
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync grades. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
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

  // Generate chart data from real progress
  const heatmapData = useMemo(() => {
    const data: { day: string; hour: number; value: number }[] = [];
    lessonsProgress.forEach(lesson => {
      const date = new Date(lesson.last_accessed);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      data.push({
        day: days[date.getDay()],
        hour: date.getHours(),
        value: lesson.time_spent
      });
    });
    return data;
  }, [lessonsProgress]);

  const subjectPerformance = useMemo(() => {
    const subjects: Record<string, { total: number; count: number }> = {};
    lessonsProgress.forEach(lesson => {
      if (!subjects[lesson.subject_id]) {
        subjects[lesson.subject_id] = { total: 0, count: 0 };
      }
      subjects[lesson.subject_id].total += lesson.score || 0;
      subjects[lesson.subject_id].count += 1;
    });
    
    return Object.entries(subjects).map(([subject, data]) => ({
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      score: data.count > 0 ? Math.round(data.total / data.count) : 0
    }));
  }, [lessonsProgress]);

  const weeklyTrendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      value: Math.floor(Math.random() * 40) + 60, // Placeholder - would calculate from real data
      value2: Math.floor(Math.random() * 30) + 50
    }));
  }, []);



  const gradeDistribution = useMemo(() => {
    const distribution = [
      { name: 'Excellent (90%+)', value: 0 },
      { name: 'Good (70-89%)', value: 0 },
      { name: 'Average (50-69%)', value: 0 },
      { name: 'Needs Work (<50%)', value: 0 },
    ];
    
    lessonsProgress.forEach(lesson => {
      const score = lesson.score || 0;
      if (score >= 90) distribution[0].value++;
      else if (score >= 70) distribution[1].value++;
      else if (score >= 50) distribution[2].value++;
      else distribution[3].value++;
    });
    
    return distribution;
  }, [lessonsProgress]);

  return (
    <AppLayout title={t('progress')} subtitle={t('trackJourney')}>
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          <JoinClassDialog />
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => syncGrades('tamo')}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Tamo
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => syncGrades('manodienynas')}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync ManoDienynas
          </Button>
        </div>
        <PDFExport type="all" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.level}</p>
                <p className="text-sm text-muted-foreground">{t('level')}</p>
                <ProgressBar value={(stats.xp / stats.nextLevelXp) * 100} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedLessons}</p>
                <p className="text-sm text-muted-foreground">{t('completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-sm text-muted-foreground">{t('avgScore')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
                <p className="text-sm text-muted-foreground">{t('studyTime')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={searchParams.get('tab') || 'overview'} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lessons">{t('lessons')}</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="grades">School Grades</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceHeatmap 
              data={heatmapData.length > 0 ? heatmapData : [
                { day: 'Mon', hour: 14, value: 5 },
                { day: 'Mon', hour: 15, value: 8 },
                { day: 'Tue', hour: 10, value: 3 },
                { day: 'Wed', hour: 16, value: 12 },
              ]} 
              title="Study Activity Heatmap"
              maxValue={30}
            />
            <RadarChart 
              data={subjectPerformance.length > 0 ? subjectPerformance : [
                { subject: 'Math', score: 75 },
                { subject: 'Science', score: 82 },
                { subject: 'Language', score: 68 },
                { subject: 'History', score: 90 },
              ]} 
              title="Subject Performance"
            />
            <LineChart 
              data={weeklyTrendData} 
              title="Weekly Score Trend"
              lines={[
                { key: "value", name: "This Week" },
                { key: "value2", name: "Last Week" }
              ]}
            />
            <PieChart 
              data={gradeDistribution}
              title="Grade Distribution"
            />
          </div>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          <Card className="border-border/40">
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChart 
              data={weeklyTrendData} 
              title="Progress Over Time"
            />
            <BarChart 
              data={subjectPerformance.map(d => ({ name: d.subject, value: d.score }))}
              title="Subject Comparison"
              horizontal
            />
            <Card className="border-border/40 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>{t('achievements')}</span>
                </CardTitle>
                <CardDescription>{t('achievementsUnlocked', { count: achievements.length })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 rounded-lg border bg-muted/30 border-border/40">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold mb-1">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <div className="col-span-4 text-center py-8">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No achievements yet. Keep learning!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grades Tab - Using new GradesDashboard */}
        <TabsContent value="grades" className="space-y-6">
          <GradesDashboard />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Progress;