import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Award, ArrowLeft, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Exams = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
    if (user) fetchAttempts();
  }, [user]);

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const fetchAttempts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    setAttempts(data || []);
  };

  const getAttemptCount = (examId: string) => {
    return attempts.filter(a => a.exam_id === examId).length;
  };

  const getBestScore = (examId: string) => {
    const examAttempts = attempts.filter(a => a.exam_id === examId);
    if (examAttempts.length === 0) return null;
    return Math.max(...examAttempts.map(a => (a.score / a.total_questions) * 100));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout title="Practice Exams" subtitle="Test your knowledge with timed exams and get detailed analytics">


        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Exams Available</h3>
              <p className="text-muted-foreground">Check back later for new practice exams</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const bestScore = getBestScore(exam.id);
              const attemptCount = getAttemptCount(exam.id);

              return (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getDifficultyColor(exam.difficulty)}>
                        {exam.difficulty}
                      </Badge>
                      <Badge variant="outline">{exam.subject}</Badge>
                    </div>
                    <CardTitle className="text-xl">{exam.title}</CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{exam.time_limit_minutes} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{JSON.parse(exam.questions).length} questions</span>
                      </div>
                    </div>

                    {attemptCount > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Best Score:</span>
                          <span className="font-bold text-blue-600">{bestScore?.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Attempts:</span>
                          <span className="font-medium">{attemptCount}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {attemptCount > 0 ? 'Retake Exam' : 'Start Exam'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Recent Attempts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attempts.slice(0, 5).map((attempt) => {
                  const exam = exams.find(e => e.id === attempt.exam_id);
                  const percentage = ((attempt.score / attempt.total_questions) * 100).toFixed(0);
                  
                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div>
                        <p className="font-medium">{exam?.title || 'Unknown Exam'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{percentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.score}/{attempt.total_questions} correct
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
    </AppLayout>
  );
};

export default Exams;