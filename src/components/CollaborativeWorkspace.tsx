import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Presentation, 
  CheckSquare, 
  Download, 
  Send, 
  Plus,
  Bot
} from "lucide-react";
import { toast } from "sonner";
import { AITutorChat } from "./AITutorChat";

interface Participant {
  id: string;
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface CollaborativeWorkspaceProps {
  matchId: string;
  participants: Participant[];
}

export const CollaborativeWorkspace = ({ matchId, participants }: CollaborativeWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState("slides");
  const [slides, setSlides] = useState<string[]>([""]);
  const [documentContent, setDocumentContent] = useState("");
  const [exercises, setExercises] = useState<{ question: string; answer: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<{ userId: string; message: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showAITutor, setShowAITutor] = useState(false);

  const addSlide = () => {
    setSlides([...slides, ""]);
  };

  const updateSlide = (index: number, content: string) => {
    const newSlides = [...slides];
    newSlides[index] = content;
    setSlides(newSlides);
  };

  const addExercise = () => {
    setExercises([...exercises, { question: "", answer: "" }]);
  };

  const downloadProject = (format: string) => {
    let content = "";
    let filename = "";
    let mimeType = "";

    switch (format) {
      case "md":
        content = `# Project\n\n## Slides\n${slides.map((s, i) => `### Slide ${i + 1}\n${s}`).join("\n\n")}\n\n## Document\n${documentContent}\n\n## Exercises\n${exercises.map((e, i) => `${i + 1}. ${e.question}\n   Answer: ${e.answer}`).join("\n")}`;
        filename = "project.md";
        mimeType = "text/markdown";
        break;
      case "txt":
        content = `Project Export\n\nSlides:\n${slides.join("\n---\n")}\n\nDocument:\n${documentContent}\n\nExercises:\n${exercises.map((e, i) => `${i + 1}. Q: ${e.question} A: ${e.answer}`).join("\n")}`;
        filename = "project.txt";
        mimeType = "text/plain";
        break;
      case "json":
        content = JSON.stringify({ slides, document: documentContent, exercises }, null, 2);
        filename = "project.json";
        mimeType = "application/json";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${filename}`);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      userId: "current",
      message: chatInput,
      timestamp: new Date().toISOString()
    }]);
    setChatInput("");
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Panel - Participants */}
      <div className="w-20 flex flex-col items-center gap-3 py-4 bg-muted rounded-lg">
        {participants.map((p) => (
          <div key={p.id} className="relative group">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={p.profiles?.avatar_url} />
              <AvatarFallback>
                {p.profiles?.display_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {p.profiles?.display_name || "User"}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Collaborative Workspace</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadProject("md")}>
                  <Download className="h-4 w-4 mr-1" /> MD
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadProject("txt")}>
                  <Download className="h-4 w-4 mr-1" /> TXT
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadProject("json")}>
                  <Download className="h-4 w-4 mr-1" /> JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="slides">
                  <Presentation className="h-4 w-4 mr-2" /> Slides
                </TabsTrigger>
                <TabsTrigger value="document">
                  <FileText className="h-4 w-4 mr-2" /> Document
                </TabsTrigger>
                <TabsTrigger value="exercises">
                  <CheckSquare className="h-4 w-4 mr-2" /> Exercises
                </TabsTrigger>
              </TabsList>

              <TabsContent value="slides" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {slides.map((slide, idx) => (
                      <Card key={idx}>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Slide {idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            placeholder="Enter slide content..."
                            value={slide}
                            onChange={(e) => updateSlide(idx, e.target.value)}
                            rows={4}
                          />
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={addSlide} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Slide
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="document" className="mt-4">
                <Textarea
                  placeholder="Write your document here..."
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={15}
                  className="font-mono"
                />
              </TabsContent>

              <TabsContent value="exercises" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {exercises.map((exercise, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-4 space-y-2">
                          <Input
                            placeholder="Question"
                            value={exercise.question}
                            onChange={(e) => {
                              const newExercises = [...exercises];
                              newExercises[idx].question = e.target.value;
                              setExercises(newExercises);
                            }}
                          />
                          <Input
                            placeholder="Answer"
                            value={exercise.answer}
                            onChange={(e) => {
                              const newExercises = [...exercises];
                              newExercises[idx].answer = e.target.value;
                              setExercises(newExercises);
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={addExercise} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Exercise
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chat & AI Tutor */}
      <div className="w-80 flex flex-col gap-4">
        {/* Team Chat */}
        <Card className="flex-1">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Team Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[200px]">
            <ScrollArea className="flex-1 mb-2">
              <div className="space-y-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="text-sm p-2 bg-muted rounded">
                    <span className="font-medium">User: </span>
                    {msg.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <Button size="icon" onClick={sendChat}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Tutor Toggle */}
        <Button
          onClick={() => setShowAITutor(!showAITutor)}
          className="w-full"
          variant={showAITutor ? "secondary" : "default"}
        >
          <Bot className="h-4 w-4 mr-2" />
          {showAITutor ? "Hide AI Tutor" : "Ask AI Tutor"}
        </Button>

        {showAITutor && (
          <AITutorChat
            subject="Collaborative Learning"
            onClose={() => setShowAITutor(false)}
          />
        )}
      </div>
    </div>
  );
};
