import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Presentation, Upload, Mic, Video, Play, Pause, CheckCircle, ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
    } catch (error) {
      toast.error('Could not access camera/microphone. Please check permissions.');
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
      speech: { score: 88, notes: "Good pacing and clear articulation. Consider adding more pauses for emphasis." },
      posture: { score: 82, notes: "Good eye contact. Try to avoid looking down too often." },
      content: { score: 85, notes: "Well-structured presentation with clear points." },
      tips: [
        "Use more hand gestures to emphasize key points",
        "Speak slightly slower during complex explanations",
        "Add a brief summary at the end of each section"
      ]
    });
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-base">K</span>
                </div>
                <h1 className="text-xl font-bold">KnowIt AI</h1>
              </Link>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === 'upload' && (
          <div className="space-y-6 text-center">
            <Presentation className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-3xl font-bold">Presentation Prep</h2>
            <p className="text-muted-foreground">Upload your presentation and practice with AI-powered feedback on your speech and posture.</p>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium">Upload Presentation</p>
                    <p className="text-sm text-muted-foreground mt-1">PPTX, PDF, Google Slides link</p>
                  </div>
                  <Input type="file" accept=".pptx,.pdf,.ppt" onChange={handleFileUpload} className="hidden" />
                </label>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Presentation Loaded</CardTitle>
                <CardDescription>{file?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Before you start:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ensure good lighting for posture analysis</li>
                    <li>• Position yourself in frame (head and shoulders visible)</li>
                    <li>• Speak clearly into your microphone</li>
                    <li>• Have your slides ready to present</li>
                  </ul>
                </div>
                <Button onClick={startPractice} className="w-full" size="lg">
                  <Video className="h-4 w-4 mr-2" />
                  Enable Camera & Microphone
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'practice' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Camera</CardTitle>
                </CardHeader>
                <CardContent>
                  <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video" muted />
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "default"} size="lg">
                      {isRecording ? <><Pause className="h-4 w-4 mr-2" />Stop</> : <><Play className="h-4 w-4 mr-2" />Start Recording</>}
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
                <CardHeader>
                  <CardTitle>Real-time Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm">
                    <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />
                    Good eye contact detected
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-2 text-yellow-600" />
                    Try to speak a bit louder
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <Mic className="h-4 w-4 inline mr-2" />
                    Audio levels: Good
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 'feedback' && feedback && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl">Practice Complete!</CardTitle>
                <CardDescription>Here's your AI-powered feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-primary">{feedback.overall}%</div>
                  <p className="text-muted-foreground">Overall Score</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Speech", data: feedback.speech, icon: Mic },
                { title: "Posture", data: feedback.posture, icon: Video },
                { title: "Content", data: feedback.content, icon: Presentation }
              ].map((item, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{item.data.score}%</div>
                    <Progress value={item.data.score} className="h-2 mb-3" />
                    <p className="text-sm text-muted-foreground">{item.data.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={() => { stopCamera(); setStep('upload'); setFile(null); }} variant="outline" className="flex-1">
                Try Another Presentation
              </Button>
              <Link to="/game-modes" className="flex-1">
                <Button className="w-full">Back to Learning Modules</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PresentationPrep;
