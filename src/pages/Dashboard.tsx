import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, RefreshCw, Play, Target, BookOpen, Clock, Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TherapistModal } from "@/components/TherapistModal";
import { useTherapistCheckin } from "@/hooks/useTherapistCheckin";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isPremium, setIsPremium] = useState(false);
  const { shouldShowCheckin, setShouldShowCheckin } = useTherapistCheckin();
  const [stats, setStats] = useState({
    totalLessons: 0,
    hoursLearned: 0,
    streak: 7,
    level: 1,
    xp: 0,
  });

  const [grades, setGrades] = useState([
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
    };
    
    checkUserStatus();
  }, [user]);

  const handleSyncGrades = () => {
    console.log("Syncing grades...");
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
                <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
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
              <Button onClick={handleSyncGrades} size="sm" variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync
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
