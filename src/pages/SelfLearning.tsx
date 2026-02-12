import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trash2 } from "lucide-react";
import { FieldSubjectSelector } from "@/components/self-learning/FieldSubjectSelector";
import { LearningEnvironment } from "@/components/self-learning/LearningEnvironment";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SelectedState {
  field: { id: string; name: string; icon: string; description: string; subjects: any[] };
  subject: { id: string; name: string; description: string; difficulty: string };
}

interface SavedWorkspace {
  id: string;
  subject_id: string;
  subject_name: string;
  last_accessed: string;
  updated_at: string;
}

const SelfLearning = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<SelectedState | null>(null);
  const [savedWorkspaces, setSavedWorkspaces] = useState<SavedWorkspace[]>([]);

  useEffect(() => {
    loadWorkspaces();
  }, [user]);

  const loadWorkspaces = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('self_learning_workspaces')
      .select('id, subject_id, subject_name, last_accessed, updated_at')
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false });
    if (data) setSavedWorkspaces(data);
  };

  const openSavedWorkspace = (ws: SavedWorkspace) => {
    setSelected({
      field: { id: 'saved', name: 'Saved', icon: '📁', description: '', subjects: [] },
      subject: { id: ws.subject_id, name: ws.subject_name, description: '', difficulty: 'intermediate' }
    });
  };

  const deleteWorkspace = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('self_learning_workspaces').delete().eq('id', id);
    setSavedWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  if (selected) {
    return (
      <LearningEnvironment
        field={selected.field}
        subject={selected.subject}
        onExit={() => {
          setSelected(null);
          loadWorkspaces();
        }}
      />
    );
  }

  return (
    <AppLayout title="Self-Learning" subtitle="Open or create a workspace for any subject">
      {/* Saved Workspaces */}
      {savedWorkspaces.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Workspaces
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedWorkspaces.map((ws) => (
              <Card
                key={ws.id}
                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
                onClick={() => openSavedWorkspace(ws)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{ws.subject_name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last edited {new Date(ws.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={(e) => deleteWorkspace(ws.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subject Selector */}
      <FieldSubjectSelector
        onSelect={(field, subject) => setSelected({ field, subject })}
      />
    </AppLayout>
  );
};

export default SelfLearning;
