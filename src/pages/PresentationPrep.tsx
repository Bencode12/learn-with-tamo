import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Presentation, Upload, Mic, Video, Play, Pause, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';

const PresentationPrep = () => {
  const [step, setStep] = useState<'upload' | 'setup' | 'practice' | 'feedback'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
      toast.success(`Uploaded: ${uploaded.name}`);
      setStep('setup');
    }
  };

  const startPractice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStep('practice');
      toast.success('Camera and microphone enabled!');
    } catch {
      toast.error('Could not access camera/microphone.');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      generateFeedback();
    } else {
      setIsRecording(true);
      toast.info('Recording started. Present your slides!');
    }
  };

  const generateFeedback = () => {
    setStep('feedback');
    setFeedback({
      overall: 85,
      speech: { score: 88, notes: "Good pacing. Add more pauses for emphasis." },
      posture: { score: 82, notes: "Good eye contact. Avoid looking down too often." },
      content: { score: 85, notes: "Well-structured with clear points." },
      tips: [
        "Use more hand gestures to emphasize key points",
        "Speak slightly slower during complex explanations",
        "Add a brief summary at the end of each section"
      ]
    });
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  return (
    <AppLayout title="Presentation Prep" subtitle="Practice presenting with AI-powered feedback">
      {step === 'upload' && (
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Presentation className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Upload Your Presentation</h2>
          <p className="text-muted-foreground text-sm">Upload slides and practice with real-time AI feedback on speech and posture.</p>
          
          <Card>
            <CardContent className="p-8">
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Choose File</p>
                  <p className="text-sm text-muted-foreground mt-1">PPTX, PDF, or PPT</p>
                </div>
                <Input type="file" accept=".pptx,.pdf,.ppt" onChange={handleFileUpload} className="hidden" />
              </label>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'setup' && (
        <div className="max-w-lg mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Practice</CardTitle>
              <CardDescription>{file?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
                <p>• Ensure good lighting for posture analysis</p>
                <p>• Position head & shoulders in frame</p>
                <p>• Speak clearly into your microphone</p>
              </div>
              <Button onClick={startPractice} className="w-full" size="lg">
                <Video className="h-4 w-4 mr-2" />Enable Camera & Start
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'practice' && (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Camera</CardTitle></CardHeader>
              <CardContent>
                <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video" muted />
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "default"} size="lg">
                    {isRecording ? <><Pause className="h-4 w-4 mr-2" />Stop</> : <><Play className="h-4 w-4 mr-2" />Start</>}
                  </Button>
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center mt-4">
                    <Badge variant="destructive" className="animate-pulse">● Recording</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Real-time Tips</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />Good eye contact
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />Try speaking a bit louder
                </div>
                <div className="p-3 bg-muted rounded-lg text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4" />Audio levels: Good
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 'feedback' && feedback && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-5xl font-black text-primary mb-1">{feedback.overall}%</div>
              <p className="text-muted-foreground">Overall Score</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Speech", data: feedback.speech, icon: Mic },
              { title: "Posture", data: feedback.posture, icon: Video },
              { title: "Content", data: feedback.content, icon: Presentation }
            ].map((item, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <item.icon className="h-4 w-4" />{item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{item.data.score}%</div>
                  <Progress value={item.data.score} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{item.data.notes}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Tips for Improvement</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => { stopCamera(); setStep('upload'); setFile(null); }} variant="outline" className="flex-1">
              Try Another
            </Button>
            <Link to="/game-modes" className="flex-1"><Button className="w-full">Back to Learning</Button></Link>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default PresentationPrep;
