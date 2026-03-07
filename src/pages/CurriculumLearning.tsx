import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Loader2, RefreshCw, Sparkles, ArrowRight, GraduationCap, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiaryEntry {
  subject: string;
  classwork: string;
  homework: string;
  date: string;
}

interface GeneratedLesson {
  subject: string;
  classwork: string;
  homework: string;
  lesson: any;
  date: string;
}

const CurriculumLearning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [generatedLessons, setGeneratedLessons] = useState<GeneratedLesson[]>([]);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    if (user) {
      checkCredentialsAndLoad();
    }
  }, [user]);

  const checkCredentialsAndLoad = async () => {
    setLoading(true);
    
    // Check if user has ManoDienynas credentials
    const { data: creds } = await supabase
      .from('user_credentials')
      .select('id')
      .eq('user_id', user!.id)
      .eq('service_name', 'manodienynas')
      .maybeSingle();
    
    setHasCredentials(!!creds);
    
    if (creds) {
      await loadTodaysDiary();
    }
    
    setLoading(false);
  };

  const loadTodaysDiary = async () => {
    // For now, we'll use synced_grades to find today's subjects
    // and then generate lessons based on them
    const today = new Date().toISOString().split('T')[0];
    
    const { data: grades } = await supabase
      .from('synced_grades')
      .select('subject, grade_type, notes, teacher_name')
      .eq('user_id', user!.id)
      .eq('source', 'manodienynas')
      .order('synced_at', { ascending: false });

    if (grades && grades.length > 0) {
      // Group by subject - get unique subjects from recent grades
      const subjectMap = new Map<string, DiaryEntry>();
      grades.forEach(g => {
        if (!subjectMap.has(g.subject)) {
          subjectMap.set(g.subject, {
            subject: g.subject,
            classwork: g.grade_type || 'Klasės darbas',
            homework: g.notes || '',
            date: today,
          });
        }
      });
      setDiaryEntries(Array.from(subjectMap.values()).slice(0, 12));
    }
  };

  const syncDiary = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-manodienynas', {
        body: { action: 'sync' }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Sync failed');

      toast.success(`Synced ${data.gradesStored} grades`);
      await loadTodaysDiary();
    } catch (e: any) {
      toast.error(e.message || 'Failed to sync');
    }
    setSyncing(false);
  };

  const generateLessonForSubject = async (entry: DiaryEntry) => {
    setGeneratingFor(entry.subject);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          subject: entry.subject,
          field: entry.classwork,
          topic: `Today's class: ${entry.classwork}. Homework: ${entry.homework || 'Review material'}`,
          difficulty: "intermediate",
          lessonNumber: 1,
          weekNumber: 1,
        }
      });

      if (error) throw error;

      const newLesson: GeneratedLesson = {
        subject: entry.subject,
        classwork: entry.classwork,
        homework: entry.homework,
        lesson: data.lesson,
        date: entry.date,
      };

      setGeneratedLessons(prev => {
        const filtered = prev.filter(l => l.subject !== entry.subject);
        return [...filtered, newLesson];
      });

      toast.success(`Lesson generated for ${entry.subject}`);
    } catch (e: any) {
      toast.error(`Failed to generate lesson for ${entry.subject}`);
    }

    setGeneratingFor(null);
  };

  const openLesson = (index: number) => {
    setActiveLessonIndex(index);
    setCurrentSection(0);
  };

  // Active lesson view
  if (activeLessonIndex !== null && generatedLessons[activeLessonIndex]) {
    const gl = generatedLessons[activeLessonIndex];
    const lesson = gl.lesson;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
            <Button variant="ghost" size="sm" onClick={() => setActiveLessonIndex(null)}>
              ← Back
            </Button>
            <span className="text-sm font-medium truncate">{gl.subject} — {lesson?.title}</span>
            <Badge variant="outline">{lesson?.duration_minutes || 30}m</Badge>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {lesson?.sections && lesson.sections.length > 0 && (
            <>
              <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">
                <strong>Class work:</strong> {gl.classwork} | <strong>Homework:</strong> {gl.homework || 'N/A'}
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge>{lesson.sections[currentSection]?.type || 'content'}</Badge>
                    <span className="text-sm text-muted-foreground">{currentSection + 1}/{lesson.sections.length}</span>
                  </div>
                  <CardTitle>{lesson.sections[currentSection]?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {lesson.sections[currentSection]?.content}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" disabled={currentSection === 0} onClick={() => setCurrentSection(s => s - 1)}>
                  Previous
                </Button>
                <Button disabled={currentSection >= lesson.sections.length - 1} onClick={() => setCurrentSection(s => s + 1)}>
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {lesson.key_concepts && (
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2">Key Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.key_concepts.map((c: string, i: number) => (
                        <Badge key={i} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  // Main view
  return (
    <AppLayout title="School Curriculum" subtitle="AI lessons from your daily classwork and homework">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !hasCredentials ? (
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-bold">Connect ManoDienynas</h3>
            <p className="text-muted-foreground">
              To generate lessons from your school diary, first connect your ManoDienynas account in Settings → Grade Sync.
            </p>
            <Button onClick={() => navigate('/settings')}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Sync header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Your Subjects
              </h3>
              <p className="text-sm text-muted-foreground">
                {diaryEntries.length} subjects found from ManoDienynas
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={syncDiary} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync
            </Button>
          </div>

          {diaryEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No data yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click Sync to pull your latest school data from ManoDienynas.
                </p>
                <Button onClick={syncDiary} disabled={syncing}>
                  {syncing ? "Syncing..." : "Sync Now"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diaryEntries.map((entry, idx) => {
                const existingLesson = generatedLessons.find(l => l.subject === entry.subject);
                const isGenerating = generatingFor === entry.subject;

                return (
                  <Card key={idx} className="hover:border-primary/30 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{entry.subject}</CardTitle>
                        {existingLesson && (
                          <Badge variant="secondary" className="text-xs">Lesson Ready</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {entry.classwork && <span>Class: {entry.classwork}</span>}
                        {entry.homework && <span> · HW: {entry.homework}</span>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {existingLesson ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => openLesson(generatedLessons.indexOf(existingLesson))}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Open Lesson
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateLessonForSubject(entry)}
                            disabled={isGenerating}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => generateLessonForSubject(entry)}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                          ) : (
                            <><Sparkles className="h-4 w-4 mr-2" />Generate Lesson</>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default CurriculumLearning;
