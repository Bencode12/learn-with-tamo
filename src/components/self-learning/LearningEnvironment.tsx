import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe, Maximize2, Minimize2, ExternalLink, FileText, Presentation, Table, Users, Link2, Copy, MessageSquare } from "lucide-react";
import { LaTeXEditor } from "./LaTeXEditor";
import { DocumentEditor } from "./DocumentEditor";
import { PresentationEditor } from "./PresentationEditor";
import { SpreadsheetEditor } from "./SpreadsheetEditor";
import { WebBrowser } from "./WebBrowser";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LearningEnvironmentProps {
  field: { id: string; name: string; icon: string };
  subject: { id: string; name: string };
  onExit: () => void;
}

export const LearningEnvironment = ({ field, subject, onExit }: LearningEnvironmentProps) => {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showChat, setShowChat] = useState(false);
  const [latexContent, setLatexContent] = useState('');
  const [browserUrl, setBrowserUrl] = useState("https://en.wikipedia.org");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('latex');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<{id: string; sender: string; message: string; time: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Invite state
  const [inviteLink, setInviteLink] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [participants, setParticipants] = useState<{id: string; name: string}[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  // Load workspace
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
        setLatexContent(data.latex_content || '');
        setBrowserUrl(data.browser_url || 'https://en.wikipedia.org');
      }
      
      // Check premium
      const { data: profile } = await supabase.from('profiles').select('is_premium, display_name').eq('id', user.id).single();
      if (profile) {
        setIsPremium(!!profile.is_premium);
        setParticipants([{ id: user.id, name: profile.display_name || 'You' }]);
      }
      
      // Generate invite link
      setInviteLink(`${window.location.origin}/self-learning?invite=${subject.id}&room=${user.id.slice(0,8)}`);
    };
    loadWorkspace();
  }, [user, subject.id]);

  const saveWorkspace = useCallback(async (contentUpdates: { latex_content?: string; browser_url?: string } = {}) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('self_learning_workspaces')
        .upsert({
          user_id: user.id,
          subject_id: subject.id,
          subject_name: subject.name,
          latex_content: contentUpdates.latex_content ?? latexContent,
          browser_url: contentUpdates.browser_url ?? browserUrl,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,subject_id' });
      if (error) throw error;
      if (contentUpdates.latex_content !== undefined) setLatexContent(contentUpdates.latex_content);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [user, subject.id, subject.name, latexContent, browserUrl, saving]);

  const handleManualSave = async () => {
    await saveWorkspace();
    toast.success("Workspace saved!");
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
    await saveWorkspace();
    onExit();
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied!");
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'You',
      message: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const maxParticipants = isPremium ? 6 : 3;

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
          {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
          <Button variant="outline" size="sm" onClick={handleManualSave} disabled={saving}>Save</Button>
        </div>
        <div className="flex items-center gap-2">
          {/* Participants */}
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {participants.length}/{maxParticipants}
          </Badge>
          
          {/* Invite */}
          <Dialog open={showInvite} onOpenChange={setShowInvite}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Invite</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite to Workspace</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share this link to invite others. {isPremium ? 'Up to 6 people' : 'Up to 3 people (upgrade for 6)'}.
                </p>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="text-sm" />
                  <Button onClick={copyInviteLink} size="sm"><Copy className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Participants ({participants.length}/{maxParticipants})</p>
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">{p.name[0]}</div>
                      <span className="text-sm">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Chat toggle */}
          <Button
            variant={showChat ? "default" : "outline"}
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="gap-1"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Editor */}
      <div className={`${showChat ? 'w-1/2' : 'w-full'} min-h-0 flex flex-col`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="latex" className="gap-2"><FileText className="h-4 w-4" /><span className="hidden sm:inline">LaTeX</span></TabsTrigger>
                <TabsTrigger value="document" className="gap-2"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Document</span></TabsTrigger>
                <TabsTrigger value="presentation" className="gap-2"><Presentation className="h-4 w-4" /><span className="hidden sm:inline">Slides</span></TabsTrigger>
                <TabsTrigger value="spreadsheet" className="gap-2"><Table className="h-4 w-4" /><span className="hidden sm:inline">Sheet</span></TabsTrigger>
                <TabsTrigger value="browser" className="gap-2"><Globe className="h-4 w-4" /><span className="hidden sm:inline">Browser</span></TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 min-h-0 p-4 pt-0">
              <TabsContent value="latex" className="h-full mt-0">
                <LaTeXEditor 
                  subject={subject.name} 
                  field={field.name}
                  initialContent={latexContent}
                  onSave={(content) => saveWorkspace({ latex_content: content })}
                  onAutoSave={(content) => saveWorkspace({ latex_content: content })}
                />
              </TabsContent>
              <TabsContent value="document" className="h-full mt-0">
                <DocumentEditor subject={subject.name} />
              </TabsContent>
              <TabsContent value="presentation" className="h-full mt-0">
                <PresentationEditor subject={subject.name} />
              </TabsContent>
              <TabsContent value="spreadsheet" className="h-full mt-0">
                <SpreadsheetEditor subject={subject.name} />
              </TabsContent>
              <TabsContent value="browser" className="h-full mt-0">
                <WebBrowser subject={subject.name} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-1/2 border-l flex flex-col min-h-0">
            <div className="p-3 border-b bg-muted/20">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Workspace Chat
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                </div>
              )}
              {chatMessages.map(msg => (
                <div key={msg.id} className="mb-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm bg-muted rounded-lg p-2">{msg.message}</p>
                </div>
              ))}
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..." 
                className="text-sm"
              />
              <Button size="sm" onClick={sendChatMessage} disabled={!chatInput.trim()}>
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};