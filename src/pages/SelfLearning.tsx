import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trash2, Plus, FolderOpen } from "lucide-react";
import { FieldSubjectSelector } from "@/components/self-learning/FieldSubjectSelector";
import { LearningEnvironment } from "@/components/self-learning/LearningEnvironment";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [pendingSelection, setPendingSelection] = useState<SelectedState | null>(null);
  const [showChoiceDialog, setShowChoiceDialog] = useState(false);

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

  const handleSubjectSelect = (field: any, subject: any) => {
    const selection: SelectedState = { field, subject };
    // Check if there's already a workspace for this subject
    const existing = savedWorkspaces.find(ws => ws.subject_id === subject.id);
    if (existing) {
      setPendingSelection(selection);
      setShowChoiceDialog(true);
    } else {
      // No existing workspace, start new directly
      setSelected(selection);
    }
  };

  const openExisting = () => {
    if (pendingSelection) {
      setSelected(pendingSelection);
      setPendingSelection(null);
      setShowChoiceDialog(false);
    }
  };

  const startNew = async () => {
    if (!pendingSelection || !user) return;
    // Delete existing workspace for this subject to start fresh
    await supabase
      .from('self_learning_workspaces')
      .delete()
      .eq('user_id', user.id)
      .eq('subject_id', pendingSelection.subject.id);
    setSelected(pendingSelection);
    setPendingSelection(null);
    setShowChoiceDialog(false);
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
        onSelect={(field, subject) => handleSubjectSelect(field, subject)}
      />

      {/* Choice Dialog: New or Existing */}
      <Dialog open={showChoiceDialog} onOpenChange={setShowChoiceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingSelection?.subject.name} Workspace
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You already have a workspace for this subject. What would you like to do?
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button variant="outline" onClick={openExisting} className="h-auto flex flex-col gap-2 py-4">
              <FolderOpen className="h-6 w-6" />
              <span className="font-medium">Open Existing</span>
              <span className="text-xs text-muted-foreground">Continue where you left off</span>
            </Button>
            <Button variant="outline" onClick={startNew} className="h-auto flex flex-col gap-2 py-4">
              <Plus className="h-6 w-6" />
              <span className="font-medium">Start New</span>
              <span className="text-xs text-muted-foreground">Reset and begin fresh</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SelfLearning;