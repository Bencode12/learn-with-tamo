import { useState, useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Bot, User, Loader2, Sparkles, Copy, Check, 
  FileText, Download, Trash2, RotateCcw 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LaTeXEditorProps {
  subject: string;
  field: string;
  initialContent?: string | null;
  onSave?: (content: string) => void;
  onAutoSave?: (content: string) => void;
}

const defaultLatex = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amssymb}

\\title{My Notes}
\\author{Student}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Start writing your notes here...

\\section{Equations}
Here's a sample equation:
\\begin{equation}
E = mc^2
\\end{equation}

And an inline equation: $a^2 + b^2 = c^2$

\\section{Lists}
\\begin{itemize}
  \\item First item
  \\item Second item
  \\item Third item
\\end{itemize}

\\end{document}`;

export const LaTeXEditor = ({ subject, field, initialContent, onSave, onAutoSave }: LaTeXEditorProps) => {
  const [latex, setLatex] = useState(initialContent || defaultLatex);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial content when it arrives
  useEffect(() => {
    if (initialContent !== undefined && initialContent !== null) {
      setLatex(initialContent || defaultLatex);
    }
  }, [initialContent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!onAutoSave) return;
    const interval = setInterval(() => {
      onAutoSave(latex);
    }, 30000);
    return () => clearInterval(interval);
  }, [latex, onAutoSave]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const renderLatexPreview = () => {
    try {
      // Extract content between \begin{document} and \end{document}
      const docMatch = latex.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
      const content = docMatch ? docMatch[1] : latex;
      
      // Extract title
      const titleMatch = latex.match(/\\title\{([^}]*)\}/);
      const title = titleMatch ? titleMatch[1] : "";
      
      // Process the content
      let processed = content
        // Remove maketitle
        .replace(/\\maketitle/g, title ? `<h1 class="text-2xl font-bold mb-4">${title}</h1>` : "")
        // Convert sections
        .replace(/\\section\{([^}]*)\}/g, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
        .replace(/\\subsection\{([^}]*)\}/g, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
        // Convert itemize/enumerate
        .replace(/\\begin\{itemize\}/g, '<ul class="list-disc ml-6 my-2">')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\begin\{enumerate\}/g, '<ol class="list-decimal ml-6 my-2">')
        .replace(/\\end\{enumerate\}/g, '</ol>')
        .replace(/\\item\s*/g, '<li class="my-1">')
        // Handle display equations
        .replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (_, eq) => {
          try {
            return `<div class="my-4 text-center">${katex.renderToString(eq.trim(), { displayMode: true, throwOnError: false })}</div>`;
          } catch {
            return `<div class="text-destructive">Error rendering: ${eq}</div>`;
          }
        })
        .replace(/\\begin\{align\}([\s\S]*?)\\end\{align\}/g, (_, eq) => {
          try {
            return `<div class="my-4 text-center">${katex.renderToString(eq.trim(), { displayMode: true, throwOnError: false })}</div>`;
          } catch {
            return `<div class="text-destructive">Error rendering: ${eq}</div>`;
          }
        })
        // Handle display math $$...$$
        .replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => {
          try {
            return `<div class="my-4 text-center">${katex.renderToString(eq.trim(), { displayMode: true, throwOnError: false })}</div>`;
          } catch {
            return `<div class="text-destructive">Error</div>`;
          }
        })
        // Handle inline math $...$
        .replace(/\$([^$\n]+)\$/g, (_, eq) => {
          try {
            return katex.renderToString(eq.trim(), { throwOnError: false });
          } catch {
            return `<span class="text-destructive">${eq}</span>`;
          }
        })
        // Handle textbf and textit
        .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
        // Handle newlines
        .replace(/\\\\/g, '<br/>')
        // Clean up extra newlines
        .replace(/\n\n+/g, '</p><p class="my-2">')
        .replace(/\n/g, ' ');

      return `<div class="prose prose-sm dark:prose-invert max-w-none"><p class="my-2">${processed}</p></div>`;
    } catch (error) {
      return `<div class="text-destructive">Error rendering LaTeX</div>`;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are a LaTeX and ${subject} expert assistant. Help users write LaTeX documents and understand ${subject} concepts.

Current LaTeX document:
\`\`\`latex
${latex}
\`\`\`

When providing LaTeX code, format it clearly. When explaining ${subject} concepts, be clear and educational.
If the user asks for LaTeX code, provide it in a code block.`;

      const response = await supabase.functions.invoke("ai-tutor", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      const assistantMessage = data.choices?.[0]?.message?.content || data.response || "Sorry, I couldn't process that.";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("AI error:", error);
      toast.error("Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const insertLatexFromAI = (content: string) => {
    // Extract LaTeX code blocks from AI response
    const codeBlockMatch = content.match(/```(?:latex)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      const codeToInsert = codeBlockMatch[1].trim();
      if (editorRef.current) {
        const selection = editorRef.current.getSelection();
        const id = { major: 1, minor: 1 };
        const op = { identifier: id, range: selection, text: codeToInsert, forceMoveMarkers: true };
        editorRef.current.executeEdits("ai-insert", [op]);
        toast.success("Code inserted!");
      }
    } else {
      toast.info("No code block found in the message");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLatex = () => {
    const blob = new Blob([latex], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.tex";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const resetEditor = () => {
    setLatex(defaultLatex);
    toast.success("Editor reset!");
  };

  return (
    <div className="h-full flex gap-4">
      {/* Left: Editor + Preview */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Copy</span>
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLatex}>
            <Download className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Download .tex</span>
          </Button>
          {onSave && (
            <Button variant="default" size="sm" onClick={() => onSave(latex)}>
              <span>💾</span>
              <span className="ml-2 hidden sm:inline">Save</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={resetEditor}>
            <RotateCcw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Reset</span>
          </Button>
        </div>

        {/* Editor and Preview Split */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          {/* Monaco Editor */}
          <Card className="overflow-hidden">
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                LaTeX Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-48px)]">
              <Editor
                height="100%"
                defaultLanguage="latex"
                value={latex}
                onChange={(value) => setLatex(value || "")}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="overflow-hidden">
            <CardHeader className="py-2 px-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[calc(100%-48px)] overflow-auto">
              <div
                dangerouslySetInnerHTML={{ __html: renderLatexPreview() }}
                className="min-h-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: AI Chat */}
      <Card className="w-80 flex flex-col shrink-0">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Ask me about LaTeX or {subject}!</p>
                <p className="text-xs mt-1">I can help with code and concepts.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block max-w-[90%] p-3 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                    {msg.role === "user" ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                    {msg.role === "user" ? "You" : "AI"}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === "assistant" && msg.content.includes("```") && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 text-xs"
                      onClick={() => insertLatexFromAI(msg.content)}
                    >
                      Insert Code
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <div className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about LaTeX or concepts..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="text-sm"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
