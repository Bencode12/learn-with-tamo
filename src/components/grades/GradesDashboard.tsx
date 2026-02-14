import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  GraduationCap, 
  Calendar, 
  BookOpen,
  Clock,
  Target,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  RadarChart,
  AreaChart 
} from "@/components/charts";

interface SyncedGrade {
  id: string;
  source: string;
  subject: string;
  grade: number;
  grade_type: string;
  date: string;
  semester: string;
  teacher_name: string;
  synced_at: string;
}

interface GradeStats {
  average: number;
  total: number;
  bySubject: Record<string, { grades: number[]; average: number; trend: 'up' | 'down' | 'stable' }>;
  bySource: Record<string, number>;
  recentGrades: SyncedGrade[];
}

export const GradesDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [grades, setGrades] = useState<SyncedGrade[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGrades();
    }
  }, [user]);

  const fetchGrades = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('synced_grades')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(200);

    if (!error && data) {
      setGrades(data as SyncedGrade[]);
      if (data.length > 0) {
        setLastSync(data[0].synced_at);
      }
    }
    setLoading(false);
  };

  const syncGrades = async (source: 'tamo' | 'manodienynas' | 'all') => {
    setSyncing(true);
    try {
      const action = source === 'all' ? 'sync_available' : 'sync';
      const body = source === 'all' ? { action } : { source, action: 'sync' };
      
      const { data, error } = await supabase.functions.invoke('sync-grades', { body });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Grades Synced",
          description: source === 'all' 
            ? "All connected portals have been synced" 
            : `${source === 'tamo' ? 'Tamo' : 'ManoDienynas'} grades synced successfully`
        });
        fetchGrades();
      } else if (data.requiresSetup) {
        toast({
          title: "Setup Required",
          description: "Please save your portal credentials in Settings first.",
          variant: "destructive"
        });
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync grades. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const stats = useMemo((): GradeStats => {
    const bySubject: Record<string, { grades: number[]; average: number; trend: 'up' | 'down' | 'stable' }> = {};
    const bySource: Record<string, number> = {};

    grades.forEach(g => {
      // Group by subject
      if (!bySubject[g.subject]) {
        bySubject[g.subject] = { grades: [], average: 0, trend: 'stable' };
      }
      bySubject[g.subject].grades.push(g.grade);

      // Count by source
      bySource[g.source] = (bySource[g.source] || 0) + 1;
    });

    // Calculate averages and trends
    Object.keys(bySubject).forEach(subject => {
      const subjectGrades = bySubject[subject].grades;
      bySubject[subject].average = subjectGrades.reduce((a, b) => a + b, 0) / subjectGrades.length;
      
      // Trend based on recent vs older grades
      if (subjectGrades.length >= 2) {
        const recent = subjectGrades.slice(0, Math.ceil(subjectGrades.length / 2));
        const older = subjectGrades.slice(Math.ceil(subjectGrades.length / 2));
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        if (recentAvg > olderAvg + 0.3) bySubject[subject].trend = 'up';
        else if (recentAvg < olderAvg - 0.3) bySubject[subject].trend = 'down';
      }
    });

    const allGrades = grades.map(g => g.grade);
    const average = allGrades.length > 0 
      ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length 
      : 0;

    return {
      average,
      total: grades.length,
      bySubject,
      bySource,
      recentGrades: grades.slice(0, 10)
    };
  }, [grades]);

  // Chart data
  const subjectPerformanceData = useMemo(() => {
    return Object.entries(stats.bySubject)
      .slice(0, 8)
      .map(([subject, data]) => ({
        subject: subject.length > 15 ? subject.slice(0, 12) + '...' : subject,
        score: Math.round(data.average * 10) // Convert to percentage (1-10 scale to 10-100)
      }));
  }, [stats.bySubject]);

  const gradeDistributionData = useMemo(() => {
    const distribution = [
      { name: 'Excellent (9-10)', value: 0 },
      { name: 'Good (7-8)', value: 0 },
      { name: 'Average (5-6)', value: 0 },
      { name: 'Poor (1-4)', value: 0 },
    ];

    grades.forEach(g => {
      if (g.grade >= 9) distribution[0].value++;
      else if (g.grade >= 7) distribution[1].value++;
      else if (g.grade >= 5) distribution[2].value++;
      else distribution[3].value++;
    });

    return distribution;
  }, [grades]);

  const monthlyTrendData = useMemo(() => {
    const monthlyData: Record<string, { grades: number[]; month: string }> = {};
    
    grades.forEach(g => {
      const date = new Date(g.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { grades: [], month: monthName };
      }
      monthlyData[monthKey].grades.push(g.grade);
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, data]) => ({
        name: data.month,
        value: Math.round((data.grades.reduce((a, b) => a + b, 0) / data.grades.length) * 10)
      }));
  }, [grades]);

  const gradeCountByMonth = useMemo(() => {
    const monthlyData: Record<string, { count: number; month: string }> = {};
    
    grades.forEach(g => {
      const date = new Date(g.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, month: monthName };
      }
      monthlyData[monthKey].count++;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, data]) => ({
        name: data.month,
        value: data.count
      }));
  }, [grades]);

  const subjectTrendData = useMemo(() => {
    // Get top 3 subjects by grade count for line chart
    const topSubjects = Object.entries(stats.bySubject)
      .sort(([, a], [, b]) => b.grades.length - a.grades.length)
      .slice(0, 3)
      .map(([subject]) => subject);

    const months = [...new Set(grades.map(g => {
      const date = new Date(g.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))].sort().slice(-6);

    return months.map(monthKey => {
      const monthGrades = grades.filter(g => {
        const date = new Date(g.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === monthKey;
      });

      // Calculate main value as overall average
      const allMonthGrades = monthGrades.map(g => g.grade);
      const mainValue = allMonthGrades.length > 0 
        ? Math.round((allMonthGrades.reduce((a, b) => a + b, 0) / allMonthGrades.length) * 10)
        : 0;

      // Subject-specific values
      const subject1 = monthGrades.filter(g => g.subject === topSubjects[0]);
      const subject2 = monthGrades.filter(g => g.subject === topSubjects[1]);
      const subject3 = monthGrades.filter(g => g.subject === topSubjects[2]);

      return {
        name: new Date(monthKey + '-01').toLocaleDateString('en', { month: 'short' }),
        value: mainValue,
        value2: subject1.length > 0 ? Math.round((subject1.reduce((a, b) => a + b.grade, 0) / subject1.length) * 10) : undefined,
        value3: subject2.length > 0 ? Math.round((subject2.reduce((a, b) => a + b.grade, 0) / subject2.length) * 10) : undefined
      };
    });
  }, [grades, stats.bySubject]);

  const topSubjectsForLines = useMemo(() => {
    const subjects = Object.entries(stats.bySubject)
      .sort(([, a], [, b]) => b.grades.length - a.grades.length)
      .slice(0, 3);
    
    const lines = [{ key: "value", name: "Overall Average" }];
    if (subjects[0]) lines.push({ key: "value2", name: subjects[0][0].slice(0, 12) });
    if (subjects[1]) lines.push({ key: "value3", name: subjects[1][0].slice(0, 12) });
    return lines;
  }, [stats.bySubject]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-primary" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <span className="text-muted-foreground">→</span>;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "bg-primary/10 text-primary border-primary/30";
    if (grade >= 7) return "bg-secondary text-secondary-foreground border-border";
    if (grade >= 5) return "bg-muted text-muted-foreground border-border";
    return "bg-destructive/10 text-destructive border-destructive/30";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Sync Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            School Grades
          </h2>
          <p className="text-muted-foreground text-sm">
            {lastSync 
              ? `Last synced ${new Date(lastSync).toLocaleDateString('en', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}`
              : 'Not yet synced'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncGrades('tamo')}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Tamo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncGrades('manodienynas')}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync ManoDienynas
          </Button>
          <Button
            size="sm"
            onClick={() => syncGrades('all')}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.average.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Average Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.bySubject).length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Grades</p>
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
                <p className="text-2xl font-bold">{Object.keys(stats.bySource).length}</p>
                <p className="text-sm text-muted-foreground">Connected Portals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {grades.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Grades Synced Yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your school portal to see your grades and performance trends.
            </p>
            <p className="text-sm text-muted-foreground">
              Go to Settings to save your Tamo or ManoDienynas credentials, then sync.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="details">All Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RadarChart 
                data={subjectPerformanceData}
                title="Subject Performance"
              />
              <PieChart 
                data={gradeDistributionData}
                title="Grade Distribution"
              />
            </div>

            {/* Subject Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subject Breakdown</CardTitle>
                <CardDescription>Performance by subject with trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.bySubject)
                    .sort(([, a], [, b]) => b.average - a.average)
                    .slice(0, 9)
                    .map(([subject, data]) => (
                      <div
                        key={subject}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm line-clamp-1">{subject}</h4>
                          {getTrendIcon(data.trend)}
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">{data.average.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm mb-1">
                            ({data.grades.length} grades)
                          </span>
                        </div>
                        <Progress 
                          value={data.average * 10} 
                          className="h-1.5 mt-2" 
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AreaChart
                data={monthlyTrendData}
                title="Monthly Average Trend"
                areaKey="value"
              />
              <BarChart
                data={gradeCountByMonth}
                title="Grades per Month"
                barKey="value"
              />
            </div>
            
            {topSubjectsForLines.length > 0 && subjectTrendData.length > 0 && (
              <LineChart
                data={subjectTrendData}
                title="Subject Progress Over Time"
                lines={topSubjectsForLines}
              />
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Grades
                </CardTitle>
                <CardDescription>All synced grades from your school portals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {grades.slice(0, 30).map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Badge 
                          variant="outline" 
                          className={`text-lg font-bold px-3 py-1 ${getGradeColor(grade.grade)}`}
                        >
                          {grade.grade}
                        </Badge>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{grade.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {grade.grade_type} • {grade.teacher_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-medium">{formatDate(grade.date)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {grade.source === 'tamo' ? 'Tamo' : 'ManoDienynas'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
