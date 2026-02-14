import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, RefreshCw, Play, Target, BookOpen, Clock, Flame, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TherapistModal } from "@/components/TherapistModal";
import { useTherapistCheckin } from "@/hooks/useTherapistCheckin";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { JoinClassDialog } from "@/components/JoinClassDialog";
import { useStreaks } from "@/hooks/useStreaks";

interface SyncedGrade {
  subject: string;
  grade: number;
  source: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { streak, recordActivity } = useStreaks();
  const [isPremium, setIsPremium] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { shouldShowCheckin, setShouldShowCheckin } = useTherapistCheckin();
  const [stats, setStats] = useState({
    totalLessons: 0,
    hoursLearned: 0,
    level: 1,
    xp: 0,
  });

  const [grades, setGrades] = useState<{ subject: string; grade: number; trend: 'up' | 'down' | 'stable' }[]>([
    { subject: "Mathematics", grade: 85, trend: "up" as const },
    { subject: "Science", grade: 78, trend: "down" as const },
    { subject: "English", grade: 92, trend: "up" as const },
    { subject: "History", grade: 80, trend: "stable" as const }
  ]);

  useEffect(() => {
    if (!user) return;
    
    const checkUserStatus = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, level, experience')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setIsPremium(profile.is_premium || false);
        setStats(prev => ({
          ...prev,
          level: profile.level || 1,
          xp: profile.experience || 0
        }));
      }

      // Check if user is a teacher
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['teacher', 'admin']);

      setIsTeacher(!!roles && roles.length > 0);

      // Load synced grades
      const { data: syncedGrades } = await supabase
        .from('synced_grades')
        .select('subject, grade')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20);

      if (syncedGrades && syncedGrades.length > 0) {
        // Group by subject and get average
        const subjectGrades: Record<string, number[]> = {};
        syncedGrades.forEach((g: SyncedGrade) => {
          if (!subjectGrades[g.subject]) subjectGrades[g.subject] = [];
          subjectGrades[g.subject].push(g.grade);
        });

        const processedGrades = Object.entries(subjectGrades).slice(0, 4).map(([subject, gradeList]) => ({
          subject,
          grade: Math.round(gradeList.reduce((a, b) => a + b, 0) / gradeList.length * 10), // Convert to percentage
          trend: 'stable' as const
        }));

        if (processedGrades.length > 0) {
          setGrades(processedGrades);
        }
      }

      // Load lesson stats
      const { data: lessons } = await supabase
        .from('lesson_progress')
        .select('completed, time_spent')
        .eq('user_id', user.id);

      if (lessons) {
        const completed = lessons.filter(l => l.completed).length;
        const totalMinutes = lessons.reduce((sum, l) => sum + (l.time_spent || 0), 0);
        setStats(prev => ({
          ...prev,
          totalLessons: completed,
          hoursLearned: Math.round(totalMinutes / 60)
        }));
      }
    };
    
    checkUserStatus();
  }, [user]);

  const handleSyncGrades = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-grades', {
        body: { action: 'sync_available' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Grades Synced",
          description: data.message
        });
        // Reload the page to show new grades
        window.location.reload();
      } else if (data.requiresSetup) {
        toast({
          title: "Setup Required",
          description: "Please save your Tamo credentials in Settings first.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync grades. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppLayout title="Dashboard" subtitle="Track your learning progress">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalLessons}</p>
                <p className="text-sm text-muted-foreground">Lessons</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.hoursLearned}h</p>
                <p className="text-sm text-muted-foreground">Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.level}</p>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Grades Section */}
        <div className="lg:col-span-2">
          <Card className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Current Grades
                </CardTitle>
                <CardDescription>Your academic performance</CardDescription>
              </div>
              <Button 
                onClick={handleSyncGrades} 
                size="sm" 
                variant="outline" 
                className="gap-2"
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {grades.map((grade, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{grade.subject}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={
                          grade.grade >= 85 ? "border-foreground/20 bg-foreground/5" : 
                          grade.grade >= 70 ? "border-border" : 
                          "border-destructive/50 bg-destructive/10"
                        }
                      >
                        {grade.grade}%
                      </Badge>
                      <span className={`text-sm ${
                        grade.trend === "up" ? "text-green-600" : 
                        grade.trend === "down" ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {grade.trend === "up" ? "↗" : grade.trend === "down" ? "↘" : "→"}
                      </span>
                    </div>
                  </div>
                  <Progress value={grade.grade} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-border/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/gamemodes" className="block">
                <Button className="w-full justify-between bg-foreground text-background hover:bg-foreground/90 h-12">
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start Learning
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/progress" className="block">
                <Button variant="outline" className="w-full justify-between h-12 border-border/40">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    View Progress
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <JoinClassDialog />

              {isTeacher && (
                <Link to="/teacher" className="block">
                  <Button variant="outline" className="w-full justify-between h-12 border-border/40">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Teacher Dashboard
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card className="border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level {stats.level}</span>
                <span className="text-sm text-muted-foreground">{stats.xp} / {stats.level * 1000} XP</span>
              </div>
              <Progress value={(stats.xp / (stats.level * 1000)) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {stats.level * 1000 - stats.xp} XP to next level
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <TherapistModal
        open={shouldShowCheckin}
        onOpenChange={setShouldShowCheckin}
      />
    </AppLayout>
  );
};

export default Dashboard;
