import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Building2, Target, MessageSquare, CheckCircle, Loader2, ArrowLeft, BookOpen, Star, TrendingUp } from 'lucide-react';
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
}

const JobInterviewPrep = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<'setup' | 'analysis' | 'practice' | 'complete'>('setup');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

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
        overview: `Based on industry data, ${formData.jobTitle} positions require strong technical and soft skills.`,
        keySkills: ['Communication', 'Problem Solving', 'Technical Knowledge', 'Teamwork'],
        commonQuestions: [
          { question: 'Tell me about yourself and your experience.', tips: 'Focus on relevant experience and skills.' },
          { question: `Why do you want to work as a ${formData.jobTitle}?`, tips: 'Show passion and specific knowledge.' },
          { question: 'Describe a challenging project you worked on.', tips: 'Use the STAR method.' },
          { question: 'Where do you see yourself in 5 years?', tips: 'Align with the company growth.' },
          { question: 'What are your greatest strengths and weaknesses?', tips: 'Be honest but strategic.' }
        ],
        companyInsights: formData.company ? `Research ${formData.company} culture and recent news.` : null,
        salaryRange: 'Research market rates for your location and experience.'
      };

      setSession({
        jobTitle: formData.jobTitle,
        company: formData.company,
        experienceLevel: formData.experienceLevel,
        aiAnalysis: analysisData,
        currentQuestion: 0,
        questions: analysisData.commonQuestions || []
      });

      setStep('analysis');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to analyze. Using default questions.');
      
      // Fallback session
      setSession({
        jobTitle: formData.jobTitle,
        company: formData.company,
        experienceLevel: formData.experienceLevel,
        aiAnalysis: {
          overview: `Preparing for ${formData.jobTitle} interviews.`,
          keySkills: ['Communication', 'Problem Solving', 'Technical Skills'],
          commonQuestions: [
            { question: 'Tell me about yourself.', tips: 'Keep it professional and relevant.' },
            { question: 'Why this role?', tips: 'Show genuine interest.' },
            { question: 'Describe a challenge you overcame.', tips: 'Use STAR method.' }
          ]
        },
        currentQuestion: 0,
        questions: [
          { question: 'Tell me about yourself.', tips: 'Keep it professional and relevant.' },
          { question: 'Why this role?', tips: 'Show genuine interest.' },
          { question: 'Describe a challenge you overcame.', tips: 'Use STAR method.' }
        ]
      });
      setStep('analysis');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    setStep('practice');
    setFeedback(null);
    setAnswer('');
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'interview-feedback',
          question: session.questions[session.currentQuestion]?.question,
          answer: answer,
          jobTitle: session.jobTitle
        }
      });

      if (error) throw error;

      setFeedback(data.feedback || 'Good answer! Consider adding more specific examples.');
    } catch (error) {
      setFeedback('Good answer! Consider adding more specific examples to strengthen your response.');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (!session) return;

    if (session.currentQuestion < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestion: session.currentQuestion + 1
      });
      setAnswer('');
      setFeedback(null);
    } else {
      setStep('complete');
    }
  };

  return (
    <AppLayout title="Job Interview Prep" subtitle="AI-powered interview preparation">

        {step === 'setup' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-2">Job Interview Prep</h2>
              <p className="text-muted-foreground">AI-powered interview preparation tailored to your target role</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tell us about your target role</CardTitle>
                <CardDescription>We'll analyze the role and prepare custom interview questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft, Amazon"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (5-10 years)</SelectItem>
                      <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleStartSession} disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Role...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Start Preparation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'analysis' && session && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{session.jobTitle}</CardTitle>
                    {session.company && <CardDescription>{session.company}</CardDescription>}
                  </div>
                  <Badge>{session.experienceLevel} level</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{session.aiAnalysis.overview}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Key Skills to Highlight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {session.aiAnalysis.keySkills?.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Common Interview Questions
                </CardTitle>
                <CardDescription>{session.questions.length} questions prepared for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.questions.slice(0, 3).map((q: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{q.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">💡 {q.tips}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={startPractice} className="w-full" size="lg">
              <Target className="h-4 w-4 mr-2" />
              Start Practice Interview
            </Button>
          </div>
        )}

        {step === 'practice' && session && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Practice Interview</h2>
              <Badge variant="outline">
                Question {session.currentQuestion + 1} of {session.questions.length}
              </Badge>
            </div>

            <Progress value={((session.currentQuestion + 1) / session.questions.length) * 100} className="h-2" />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {session.questions[session.currentQuestion]?.question}
                </CardTitle>
                <CardDescription>
                  💡 Tip: {session.questions[session.currentQuestion]?.tips}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full min-h-[150px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />

                {!feedback ? (
                  <Button onClick={handleSubmitAnswer} disabled={loading || !answer.trim()} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Feedback...
                      </>
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-800 mb-2">AI Feedback</h4>
                        <p className="text-green-700">{feedback}</p>
                      </CardContent>
                    </Card>
                    <Button onClick={nextQuestion} className="w-full">
                      {session.currentQuestion < session.questions.length - 1 ? 'Next Question' : 'Complete Interview'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-6 py-12">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Practice Complete!</h2>
              <p className="text-muted-foreground">You've practiced all the interview questions.</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setStep('setup')}>
                Try Another Role
              </Button>
              <Link to="/game-modes">
                <Button>Back to Learning Modules</Button>
              </Link>
            </div>
          </div>
        )}
    </AppLayout>
  );
};

export default JobInterviewPrep;
