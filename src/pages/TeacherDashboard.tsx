import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { 
  PerformanceHeatmap, 
  RadarChart, 
  AreaChart, 
  BarChart, 
  LineChart, 
  PieChart
} from "@/components/charts";
import { 
  Users, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  TrendingUp, 
  BookOpen,
  Clock,
  Target,
  GraduationCap
} from "lucide-react";


interface ClassData {
  id: string;
  name: string;
  description: string | null;
  class_code: string;
  subject: string | null;
  grade_level: string | null;
  is_active: boolean;
  student_count?: number;
}

interface StudentData {
  id: string;
  student_id: string;
  username: string;
  display_name: string | null;
  level: number;
  experience: number;
  lessons_completed: number;
  avg_score: number;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("");

  useEffect(() => {
    checkTeacherStatus();
  }, [user]);

  useEffect(() => {
    if (isTeacher) {
      loadClasses();
    }
  }, [isTeacher]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id);
    }
  }, [selectedClass]);

  const checkTeacherStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['teacher', 'admin', 'staff']);

    if (!data || data.length === 0) {
      toast({
        title: "Access Denied",
        description: "You need teacher privileges to access this page.",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }

    setIsTeacher(true);
    setLoading(false);
  };

  const loadClasses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading classes:', error);
      return;
    }

    // Get student counts
    const classesWithCounts = await Promise.all(
      (data || []).map(async (cls) => {
        const { count } = await supabase
          .from('class_students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id)
          .eq('status', 'active');
        
        return { ...cls, student_count: count || 0 };
      })
    );

    setClasses(classesWithCounts);
    if (classesWithCounts.length > 0 && !selectedClass) {
      setSelectedClass(classesWithCounts[0]);
    }
  };

  const loadStudents = async (classId: string) => {
    const { data, error } = await supabase
      .from('class_students')
      .select(`
        id,
        student_id,
        profiles!inner (
          username,
          display_name,
          level,
          experience
        )
      `)
      .eq('class_id', classId)
      .eq('status', 'active');

    if (error) {
      console.error('Error loading students:', error);
      return;
    }

    // Get lesson progress for each student
    const studentsWithProgress = await Promise.all(
      (data || []).map(async (student: any) => {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('completed, score')
          .eq('user_id', student.student_id);

        const completed = progress?.filter(p => p.completed).length || 0;
        const avgScore = progress && progress.length > 0
          ? progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length
          : 0;

        return {
          id: student.id,
          student_id: student.student_id,
          username: student.profiles.username,
          display_name: student.profiles.display_name,
          level: student.profiles.level,
          experience: student.profiles.experience,
          lessons_completed: completed,
          avg_score: Math.round(avgScore)
        };
      })
    );

    setStudents(studentsWithProgress);
  };

  const createClass = async () => {
    if (!user || !newClassName.trim()) return;

    const { data, error } = await supabase
      .from('classes')
      .insert({
        teacher_id: user.id,
        name: newClassName.trim(),
        subject: newClassSubject || null,
        grade_level: newClassGrade || null
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Class Created",
      description: `Class "${newClassName}" has been created successfully.`
    });

    setCreateDialogOpen(false);
    setNewClassName("");
    setNewClassSubject("");
    setNewClassGrade("");
    loadClasses();
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Class code copied to clipboard"
    });
  };

  const removeStudent = async (studentEnrollmentId: string) => {
    const { error } = await supabase
      .from('class_students')
      .delete()
      .eq('id', studentEnrollmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove student",
        variant: "destructive"
      });
      return;
    }

    toast({ title: "Student removed" });
    if (selectedClass) {
      loadStudents(selectedClass.id);
      loadClasses();
    }
  };

  // Generate sample data for charts
  const heatmapData = Array.from({ length: 50 }, () => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(Math.random() * 7)],
    hour: Math.floor(Math.random() * 24),
    value: Math.floor(Math.random() * 20)
  }));

  const radarData = [
    { subject: 'Math', score: 85 },
    { subject: 'Science', score: 78 },
    { subject: 'Language', score: 92 },
    { subject: 'History', score: 70 },
    { subject: 'Art', score: 88 },
    { subject: 'Music', score: 75 },
  ];

  const trendData = Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: 60 + Math.floor(Math.random() * 30),
    value2: 50 + Math.floor(Math.random() * 30)
  }));

  if (loading) {
    return (
      <AppLayout title="Teacher Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Teacher Dashboard" subtitle="Manage your classes and track student progress">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground/5 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Students</p>
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
                <p className="text-2xl font-bold">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + s.avg_score, 0) / students.length)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
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
                <p className="text-2xl font-bold">
                  {students.reduce((sum, s) => sum + s.lessons_completed, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[520px]">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Classes</h3>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Create a class and share the code with your students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Class Name *</Label>
                    <Input 
                      placeholder="e.g., Math 101" 
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={newClassSubject} onValueChange={setNewClassSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="language">Language Arts</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Select value={newClassGrade} onValueChange={setNewClassGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            Grade {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createClass} className="w-full">Create Class</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Card 
                key={cls.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedClass?.id === cls.id ? 'ring-2 ring-foreground' : 'border-border/40'
                }`}
                onClick={() => setSelectedClass(cls)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <CardDescription>
                        {cls.subject && <Badge variant="secondary" className="mr-2">{cls.subject}</Badge>}
                        {cls.grade_level && <Badge variant="outline">Grade {cls.grade_level}</Badge>}
                      </CardDescription>
                    </div>
                    <Badge variant={cls.is_active ? "default" : "secondary"}>
                      {cls.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {cls.student_count} students
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {cls.class_code}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyClassCode(cls.class_code);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {classes.length === 0 && (
              <Card className="col-span-full border-dashed">
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No classes yet</p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Class
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {selectedClass ? (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{selectedClass.name} - Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Share code <code className="px-2 py-0.5 bg-muted rounded font-mono">{selectedClass.class_code}</code> with students to join
                  </p>
                </div>
              </div>

              <Card className="border-border/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.display_name || student.username}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Lvl {student.level}</Badge>
                        </TableCell>
                        <TableCell>{student.experience} XP</TableCell>
                        <TableCell>{student.lessons_completed}</TableCell>
                        <TableCell>
                          <span className={
                            student.avg_score >= 80 ? "text-green-600" :
                            student.avg_score >= 60 ? "text-yellow-600" :
                            "text-red-600"
                          }>
                            {student.avg_score}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No students in this class yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a class to view students</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceHeatmap 
              data={heatmapData} 
              title="Class Activity Heatmap"
              maxValue={20}
            />
            <RadarChart 
              data={radarData} 
              title="Subject Performance Overview"
            />
            <LineChart 
              data={trendData} 
              title="Monthly Progress Trend"
              lines={[
                { key: "value", name: "This Year" },
                { key: "value2", name: "Last Year" }
              ]}
            />
            <AreaChart 
              data={trendData} 
              title="Cumulative Progress"
              areaKey="value"
            />
            <PieChart 
              data={[
                { name: 'Excellent (90%+)', value: 12 },
                { name: 'Good (70-89%)', value: 25 },
                { name: 'Average (50-69%)', value: 18 },
                { name: 'Needs Work (<50%)', value: 8 },
              ]}
              title="Grade Distribution"
            />
            <BarChart 
              data={radarData.map(d => ({ name: d.subject, value: d.score }))}
              title="Subject Comparison"
              horizontal
            />
          </div>
        </TabsContent>

      </Tabs>
    </AppLayout>
  );
};

export default TeacherDashboard;
