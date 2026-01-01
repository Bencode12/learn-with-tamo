import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Heart, Brain, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface TherapistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TherapistModal = ({ open, onOpenChange }: TherapistModalProps) => {
  const { user } = useAuth();
  const [moodRating, setMoodRating] = useState([3]);
  const [stressLevel, setStressLevel] = useState([3]);
  const [notes, setNotes] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Call AI function to get personalized response
      const { data: aiData, error: aiError } = await supabase.functions.invoke('therapist-chat', {
        body: { 
          moodRating: moodRating[0],
          stressLevel: stressLevel[0],
          notes 
        }
      });

      if (aiError) throw aiError;

      const response = aiData.response || "Thank you for sharing. Keep up the great work!";
      setAiResponse(response);

      // Save to database
      await supabase.from('therapist_checkins').insert({
        user_id: user.id,
        mood_rating: moodRating[0],
        stress_level: stressLevel[0],
        notes,
        ai_response: response
      });

      toast.success("Check-in completed!");
    } catch (error) {
      console.error('Therapist check-in error:', error);
      toast.error("Failed to complete check-in");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Weekly Wellness Check-In</span>
          </DialogTitle>
          <DialogDescription>
            Let's take a moment to reflect on your learning journey this week
          </DialogDescription>
        </DialogHeader>

        {!aiResponse ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span>How are you feeling today? (1-5)</span>
              </Label>
              <Slider
                value={moodRating}
                onValueChange={setMoodRating}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not great</span>
                <span>Amazing</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <span>How stressed do you feel? (1-5)</span>
              </Label>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very relaxed</span>
                <span>Very stressed</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span>Anything on your mind?</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Share your thoughts, challenges, or wins from this week..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Submit Check-In"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg">
              <p className="text-muted-foreground leading-relaxed">{aiResponse}</p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};