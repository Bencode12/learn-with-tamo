import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe, Maximize2, Minimize2, ExternalLink, FileText, Presentation, Table } from "lucide-react";
import { LaTeXEditor } from "./LaTeXEditor";
import { DocumentEditor } from "./DocumentEditor";
import { PresentationEditor } from "./PresentationEditor";
import { SpreadsheetEditor } from "./SpreadsheetEditor";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LearningEnvironmentProps {
  field: { id: string; name: string; icon: string };
  subject: { id: string; name: string };
  onExit: () => void;
}

interface WorkspaceContent {
  latex_content: string;
  document_content: string;
  presentation_content: string;
  spreadsheet_content: string;
  browser_url: string;
}

export const LearningEnvironment = ({ field, subject, onExit }: LearningEnvironmentProps) => {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("https://en.wikipedia.org");
  const [workspaceContent, setWorkspaceContent] = useState<WorkspaceContent>({
    latex_content: '',
    document_content: '',
    presentation_content: '',
    spreadsheet_content: '',
    browser_url: 'https://en.wikipedia.org'
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('latex');

  // Load saved workspace content on mount
  useEffect(() => {
    const loadWorkspace = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('self_learning_workspaces')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_id', subject.id)
        .maybeSingle();

      if (data) {
        setWorkspaceContent({
          latex_content: data.latex_content || '',
          document_content: data.document_content || '',
          presentation_content: data.presentation_content || '',
          spreadsheet_content: data.spreadsheet_content || '',
          browser_url: data.browser_url || 'https://en.wikipedia.org'
        });
        setBrowserUrl(data.browser_url || 'https://en.wikipedia.org');
      }
    };
    loadWorkspace();
  }, [user, subject.id]);

  // Auto-save every 30 seconds
  const saveWorkspace = useCallback(async (contentUpdates: Partial<WorkspaceContent> = {}) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const updatedContent = { ...workspaceContent, ...contentUpdates };
      const { error } = await supabase
        .from('self_learning_workspaces')
        .upsert({
          user_id: user.id,
          subject_id: subject.id,
          subject_name: subject.name,
          latex_content: updatedContent.latex_content,
          document_content: updatedContent.document_content,
          presentation_content: updatedContent.presentation_content,
          spreadsheet_content: updatedContent.spreadsheet_content,
          browser_url: updatedContent.browser_url,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,subject_id' });

      if (error) throw error;
      setWorkspaceContent(updatedContent);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [user, subject.id, subject.name, workspaceContent, saving]);

  const handleManualSave = async () => {
    await saveWorkspace();
    toast.success("Workspace saved!");
  };

  const updateContent = (field: keyof WorkspaceContent, value: string) => {
    setWorkspaceContent(prev => ({ ...prev, [field]: value }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExit = async () => {
    // Try to get current content from the LaTeX editor via a ref pattern
    onExit();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleExit} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Exit
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{field.icon}</span>
            <span className="text-primary font-medium">{subject.name}</span>
          </div>
          {saving && (
            <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={saving}
            className="gap-2"
          >
            Save
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showBrowser ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBrowser(!showBrowser)}
            className="gap-1"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Browser</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Editor Tabs - always visible */}
        <div className={`${showBrowser ? 'w-1/2' : 'w-full'} min-h-0 flex flex-col`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="latex" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">LaTeX</span>
                </TabsTrigger>
                <TabsTrigger value="document" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Document</span>
                </TabsTrigger>
                <TabsTrigger value="presentation" className="gap-2">
                  <Presentation className="h-4 w-4" />
                  <span className="hidden sm:inline">Slides</span>
                </TabsTrigger>
                <TabsTrigger value="spreadsheet" className="gap-2">
                  <Table className="h-4 w-4" />
                  <span className="hidden sm:inline">Sheet</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 min-h-0 p-4 pt-0">
              <TabsContent value="latex" className="h-full mt-0">
                <LaTeXEditor 
                  subject={subject.name} 
                  field={field.name}
                  initialContent={workspaceContent.latex_content}
                  onSave={(content) => {
                    updateContent('latex_content', content);
                    saveWorkspace({ latex_content: content });
                  }}
                  onAutoSave={(content) => {
                    updateContent('latex_content', content);
                    saveWorkspace({ latex_content: content });
                  }}
                />
              </TabsContent>
              
              <TabsContent value="document" className="h-full mt-0">
                <DocumentEditor 
                  subject={subject.name}
                  initialContent={workspaceContent.document_content}
                  onSave={(content) => {
                    updateContent('document_content', content);
                    saveWorkspace({ document_content: content });
                  }}
                />
              </TabsContent>
              
              <TabsContent value="presentation" className="h-full mt-0">
                <PresentationEditor 
                  subject={subject.name}
                  initialContent={workspaceContent.presentation_content}
                  onSave={(content) => {
                    updateContent('presentation_content', content);
                    saveWorkspace({ presentation_content: content });
                  }}
                />
              </TabsContent>
              
              <TabsContent value="spreadsheet" className="h-full mt-0">
                <SpreadsheetEditor 
                  subject={subject.name}
                  initialContent={workspaceContent.spreadsheet_content}
                  onSave={(content) => {
                    updateContent('spreadsheet_content', content);
                    saveWorkspace({ spreadsheet_content: content });
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Browser Panel */}
        {showBrowser && (
          <div className="w-1/2 border-l flex flex-col min-h-0">
            <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
              <input
                type="text"
                value={browserUrl}
                onChange={(e) => setBrowserUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setBrowserUrl(browserUrl)}
                className="flex-1 text-sm px-3 py-1.5 rounded border bg-background"
                placeholder="Enter URL..."
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(browserUrl, '_blank')}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <iframe
                src={browserUrl}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title="Web Browser"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
