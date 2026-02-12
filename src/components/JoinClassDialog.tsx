import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search } from "lucide-react";

export const JoinClassDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);

  const joinClass = async () => {
    if (!user || !classCode.trim()) return;

    setLoading(true);

    try {
      // Find the class by code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, is_active')
        .eq('class_code', classCode.trim().toUpperCase())
        .single();

      if (classError || !classData) {
        toast({
          title: "Class Not Found",
          description: "No class found with that code. Please check and try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!classData.is_active) {
        toast({
          title: "Class Inactive",
          description: "This class is no longer accepting new students.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', classData.id)
        .eq('student_id', user.id)
        .single();

      if (existing) {
        toast({
          title: "Already Enrolled",
          description: "You are already a member of this class.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Join the class
      const { error: joinError } = await supabase
        .from('class_students')
        .insert({
          class_id: classData.id,
          student_id: user.id
        });

      if (joinError) {
        throw joinError;
      }

      toast({
        title: "Joined Class!",
        description: `You have successfully joined ${classData.name}`
      });

      setOpen(false);
      setClassCode("");
    } catch (error) {
      console.error('Error joining class:', error);
      toast({
        title: "Error",
        description: "Failed to join class. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Join Class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
          <DialogDescription>
            Enter the class code provided by your teacher
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Class Code</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., ABC123" 
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                className="font-mono uppercase"
                maxLength={6}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The 6-character code your teacher shared with you
            </p>
          </div>
          <Button 
            onClick={joinClass} 
            className="w-full gap-2"
            disabled={loading || classCode.length !== 6}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Joining...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Join Class
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};