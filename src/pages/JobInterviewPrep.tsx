import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Target, MessageSquare, CheckCircle, Loader2, Star, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';

interface InterviewSession {
  jobTitle: string;
  company: string;
  experienceLevel: string;
  aiAnalysis: any;
  currentQuestion: number;
  questions: any[];
  answers: Record<number, { text: string; feedback: string | null }>;
}

const JobInterviewPrep = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<'setup' | 'practice' | 'complete'>('setup');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    experienceLevel: 'entry'
  });

  const handleStartSession = async () => {
    if (!formData.jobTitle) {
      toast.error('Please enter a job title');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'interview-analysis',
          jobTitle: formData.jobTitle,
          company: formData.company,
          experienceLevel: formData.experienceLevel
        }
      });

      if (error) throw error;

      const analysisData = data.analysis || {
        overview: `Preparing for ${formData.jobTitle} interviews.`,
        keySkills: ['Communication', 'Problem Solving', 'Technical Knowledge', 'Teamwork'],
        commonQuestions: [
          { question: 'Tell me about yourself and your experience.', tips: 'Focus on relevant experience.' },
          { question: `Why do you want to work as a ${formData.jobTitle}?`, tips: 'Show passion and knowledge.' },
          { question: 'Describe a challenging project you worked on.', tips: 'Use the STAR method.' },
          { question: 'Where do you see yourself in 5 years?', tips: 'Align with company growth.' },
          { question: 'What are your greatest strengths and weaknesses?', tips: 'Be honest but strategic.' }
        ],
      };

      setSession({
        jobTitle: formData.jobTitle,
        company: formData.company,
        experienceLevel: formData.experienceLevel,
        aiAnalysis: analysisData,
        currentQuestion: 0,
        questions: analysisData.commonQuestions || [],
        answers: {},
      });

      setStep('practice');
    } catch (error) {
      // Fallback
      setSession({
        jobTitle: formData.jobTitle,
        company: formData.company,
        experienceLevel: formData.experienceLevel,
        aiAnalysis: { keySkills: ['Communication', 'Problem Solving'] },
        currentQuestion: 0,
        questions: [
          { question: 'Tell me about yourself.', tips: 'Keep it professional.' },
          { question: 'Why this role?', tips: 'Show genuine interest.' },
          { question: 'Describe a challenge you overcame.', tips: 'Use STAR method.' }
        ],
        answers: {},
      });
      setStep('practice');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !session) return;
    setFeedbackLoading(true);

    let feedback = 'Good answer! Consider adding more specific examples.';
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'interview-feedback',
          question: session.questions[session.currentQuestion]?.question,
          answer,
          jobTitle: session.jobTitle
        }
      });
      if (!error && data?.feedback) feedback = data.feedback;
    } catch {}
    
    setFeedbackLoading(false);

    const updatedAnswers = {
      ...session.answers,
      [session.currentQuestion]: { text: answer, feedback }
    };
    setSession({ ...session, answers: updatedAnswers });
  };

  const nextQuestion = () => {
    if (!session) return;
    if (session.currentQuestion < session.questions.length - 1) {
      setSession({ ...session, currentQuestion: session.currentQuestion + 1 });
      setAnswer('');
    } else {
      setStep('complete');
    }
  };

  const currentFeedback = session?.answers[session.currentQuestion]?.feedback;
  const progressPercent = session ? ((session.currentQuestion + 1) / session.questions.length) * 100 : 0;

  return (
    <AppLayout title="Job Interview Prep" subtitle="AI-powered interview preparation">
      {step === 'setup' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Prepare for Your Interview</h2>
            <p className="text-muted-foreground text-sm mt-1">AI analyzes the role and generates tailored questions</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Job Title *</Label>
                <Input
                  placeholder="e.g., Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Company (Optional)</Label>
                <Input
                  placeholder="e.g., Google"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <Label>Experience Level</Label>
                <Select value={formData.experienceLevel} onValueChange={(v) => setFormData({ ...formData, experienceLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry (0-2 yrs)</SelectItem>
                    <SelectItem value="mid">Mid (2-5 yrs)</SelectItem>
                    <SelectItem value="senior">Senior (5-10 yrs)</SelectItem>
                    <SelectItem value="lead">Lead (10+ yrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStartSession} disabled={loading} className="w-full" size="lg">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" />Start Practice</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'practice' && session && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{session.jobTitle}{session.company ? ` at ${session.company}` : ''}</Badge>
            <span className="text-sm text-muted-foreground">Q{session.currentQuestion + 1}/{session.questions.length}</span>
          </div>

          <Progress value={progressPercent} className="h-2" />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">
                {session.questions[session.currentQuestion]?.question}
              </CardTitle>
              <CardDescription>
                💡 {session.questions[session.currentQuestion]?.tips}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={!!currentFeedback}
              />

              {!currentFeedback ? (
                <Button onClick={submitAnswer} disabled={feedbackLoading || !answer.trim()} className="w-full">
                  {feedbackLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Getting Feedback...</> : 'Submit Answer'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" /> AI Feedback
                      </h4>
                      <p className="text-sm text-muted-foreground">{currentFeedback}</p>
                    </CardContent>
                  </Card>
                  <Button onClick={nextQuestion} className="w-full gap-2">
                    {session.currentQuestion < session.questions.length - 1 ? <>Next Question <ArrowRight className="h-4 w-4" /></> : 'Complete Interview'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'complete' && (
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">Practice Complete!</h2>
          <p className="text-muted-foreground">You answered {session?.questions.length} interview questions.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setStep('setup'); setSession(null); setAnswer(''); }}>
              Try Another Role
            </Button>
            <Link to="/game-modes"><Button>Back to Learning</Button></Link>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default JobInterviewPrep;
