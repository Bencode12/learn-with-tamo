import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Zap, Trophy, Timer, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RandomEvent {
  id: string;
  event_type: string;
  title: string;
  description: string;
  questions: any[];
  time_limit_seconds: number;
  xp_reward: number;
}

interface RandomEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: RandomEvent | null;
}

export const RandomEventModal = ({ isOpen, onClose, event }: RandomEventModalProps) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (event && isStarted) {
      setTimeLeft(event.time_limit_seconds);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [event, isStarted]);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setIsComplete(false);
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    
    const question = event?.questions[currentQuestion];
    if (question) {
      const isCorrect = question.correct === answer || question.answer?.toLowerCase() === answer.toLowerCase();
      if (isCorrect) {
        setScore(prev => prev + 1);
      }
    }

    if (currentQuestion < (event?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    
    if (user && event) {
      try {
        await supabase.from('random_event_completions').insert({
          user_id: user.id,
          event_id: event.id,
          score
        });

        // Award XP
        const { data: profile } = await supabase
          .from('profiles')
          .select('experience')
          .eq('id', user.id)
          .single();

        if (profile) {
          const xpGained = Math.round((score / event.questions.length) * event.xp_reward);
          await supabase
            .from('profiles')
            .update({ experience: profile.experience + xpGained })
            .eq('id', user.id);
          
          toast.success(`+${xpGained} XP earned!`);
        }
      } catch (error) {
        console.error('Error saving event completion:', error);
      }
    }
  };

  const handleClose = () => {
    setIsStarted(false);
    setIsComplete(false);
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    onClose();
  };

  if (!event) return null;

  const question = event.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / event.questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {event.title}
            </DialogTitle>
            {isStarted && !isComplete && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {timeLeft}s
              </Badge>
            )}
          </div>
        </DialogHeader>

        {!isStarted ? (
          <div className="space-y-4 text-center py-6">
            <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <Zap className="h-10 w-10 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Random Event!</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <Badge variant="secondary">
                <Timer className="h-3 w-3 mr-1" />
                {event.time_limit_seconds}s
              </Badge>
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                {event.xp_reward} XP
              </Badge>
            </div>
            <Button onClick={handleStart} className="w-full" size="lg">
              Start Challenge
            </Button>
          </div>
        ) : isComplete ? (
          <div className="space-y-4 text-center py-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Challenge Complete!</h3>
              <p className="text-3xl font-bold text-primary">
                {score} / {event.questions.length}
              </p>
              <p className="text-muted-foreground">
                +{Math.round((score / event.questions.length) * event.xp_reward)} XP earned
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Continue Learning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Question {currentQuestion + 1} of {event.questions.length}
            </p>

            <Card>
              <CardContent className="p-4">
                <h4 className="text-lg font-semibold mb-4">
                  {question?.question || question?.word}
                </h4>

                {question?.options ? (
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option: string, idx: number) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="h-auto py-3 text-left"
                        onClick={() => handleAnswer(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Your answer..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAnswer((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Press Enter to submit</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
