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

  useEffect(() => {
    if (initialContent !== undefined && initialContent !== null) {
      setLatex(initialContent || defaultLatex);
    }
  }, [initialContent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      
      // Extract preamble info
      const titleMatch = latex.match(/\\title\{([^}]*)\}/);
      const title = titleMatch ? titleMatch[1] : "";
      const authorMatch = latex.match(/\\author\{([^}]*)\}/);
      const author = authorMatch ? authorMatch[1] : "";
      const dateMatch = latex.match(/\\date\{([^}]*)\}/);
      const date = dateMatch ? dateMatch[1].replace(/\\today/g, new Date().toLocaleDateString()) : "";

      // Extract custom macros from preamble
      const customMacros: Record<string, string> = {
        "\\R": "\\mathbb{R}",
        "\\N": "\\mathbb{N}",
        "\\Z": "\\mathbb{Z}",
        "\\Q": "\\mathbb{Q}",
        "\\C": "\\mathbb{C}",
        "\\implies": "\\Rightarrow",
        "\\iff": "\\Leftrightarrow",
        "\\eps": "\\varepsilon",
        "\\norm": "\\|#1\\|",
        "\\abs": "|#1|",
        "\\floor": "\\lfloor #1 \\rfloor",
        "\\ceil": "\\lceil #1 \\rceil",
      };

      // Parse \newcommand from preamble
      const newcmdRegex = /\\(?:re)?newcommand\{\\([^}]+)\}(?:\[(\d+)\])?\{([^}]+)\}/g;
      let cmdMatch;
      while ((cmdMatch = newcmdRegex.exec(latex)) !== null) {
        customMacros[`\\${cmdMatch[1]}`] = cmdMatch[3];
      }

      const renderMath = (eq: string, displayMode: boolean) => {
        try {
          return katex.renderToString(eq.trim(), { 
            displayMode, 
            throwOnError: false, 
            trust: true, 
            strict: false,
            macros: customMacros,
            maxSize: 500,
            maxExpand: 1000,
          });
        } catch {
          return `<span class="text-destructive text-xs">[math error: ${eq.substring(0, 30)}...]</span>`;
        }
      };

      // Process content step by step - order matters!
      let processed = content;

      // Remove \maketitle and replace with formatted title block
      processed = processed.replace(/\\maketitle/g, () => {
        let block = '';
        if (title) block += `<h1 class="text-2xl font-bold mb-1 text-center">${title}</h1>`;
        if (author) block += `<p class="text-center text-muted-foreground mb-0">${author}</p>`;
        if (date) block += `<p class="text-center text-muted-foreground text-sm mb-4">${date}</p>`;
        return block || '';
      });

      // Remove preamble commands that leak into content
      processed = processed
        .replace(/\\(usepackage|documentclass|setlength|pagestyle|geometry|graphicspath|bibliographystyle|bibliography|newcommand|renewcommand|DeclareMathOperator|theoremstyle|newtheorem|setcounter|numberwithin|allowdisplaybreaks)(\[.*?\])?\{[^}]*\}(\{[^}]*\})*/g, '')
        .replace(/\\tableofcontents/g, '<p class="text-muted-foreground italic text-center my-4">[Table of Contents]</p>');

      // Handle \label, \ref, \eqref, \cite
      processed = processed
        .replace(/\\label\{[^}]*\}/g, '')
        .replace(/\\eqref\{([^}]*)\}/g, '(ref)')
        .replace(/\\ref\{([^}]*)\}/g, '[ref]')
        .replace(/\\cite(\[.*?\])?\{([^}]*)\}/g, '[$2]')
        .replace(/\\nocite\{[^}]*\}/g, '');

      // Sections
      processed = processed
        .replace(/\\chapter\*?\{([^}]*)\}/g, '<h1 class="text-2xl font-bold mt-8 mb-4 pb-2 border-b">$1</h1>')
        .replace(/\\section\*?\{([^}]*)\}/g, '<h2 class="text-xl font-semibold mt-6 mb-3 border-b pb-1">$1</h2>')
        .replace(/\\subsection\*?\{([^}]*)\}/g, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
        .replace(/\\subsubsection\*?\{([^}]*)\}/g, '<h4 class="text-base font-medium mt-3 mb-1">$1</h4>')
        .replace(/\\paragraph\{([^}]*)\}/g, '<p class="font-semibold mt-2 inline">$1 </p>');

      // Environments: theorem, lemma, proof, definition, etc.
      processed = processed
        .replace(/\\begin\{(theorem|lemma|proposition|corollary|conjecture|definition|example|remark|note|axiom|property|observation)\}(\[([^\]]*)\])?/gi, 
          (_, env, __, optTitle) => {
            const label = env.charAt(0).toUpperCase() + env.slice(1);
            const titleStr = optTitle ? ` (${optTitle})` : '';
            const colors: Record<string, string> = {
              theorem: 'border-primary/60', lemma: 'border-primary/40', definition: 'border-blue-500/50',
              example: 'border-green-500/50', remark: 'border-yellow-500/50', proof: 'border-muted-foreground/30',
            };
            const borderColor = colors[env.toLowerCase()] || 'border-primary/50';
            return `<div class="border-l-4 ${borderColor} pl-4 my-4 py-1"><p class="font-bold text-sm uppercase tracking-wide mb-1">${label}${titleStr}</p>`;
          })
        .replace(/\\end\{(theorem|lemma|proposition|corollary|conjecture|definition|example|remark|note|axiom|property|observation)\}/gi, '</div>')
        .replace(/\\begin\{proof\}(\[([^\]]*)\])?/g, (_, __, title) => {
          const proofTitle = title || 'Proof';
          return `<div class="border-l-2 border-muted-foreground/30 pl-4 my-3"><p class="font-medium italic text-sm">${proofTitle}.</p>`;
        })
        .replace(/\\end\{proof\}/g, '<p class="text-right text-sm">∎</p></div>');

      // Abstract
      processed = processed
        .replace(/\\begin\{abstract\}/g, '<div class="mx-8 my-4 text-sm"><p class="font-bold text-center mb-2">Abstract</p>')
        .replace(/\\end\{abstract\}/g, '</div>');

      // Quotation / quote
      processed = processed
        .replace(/\\begin\{(quotation|quote)\}/g, '<blockquote class="border-l-2 border-muted-foreground/30 pl-4 my-3 italic text-muted-foreground">')
        .replace(/\\end\{(quotation|quote)\}/g, '</blockquote>');

      // Verbatim
      processed = processed
        .replace(/\\begin\{(verbatim|lstlisting)\}([\s\S]*?)\\end\{\1\}/g, 
          (_, _env, code) => `<pre class="bg-muted p-3 rounded text-sm font-mono overflow-x-auto my-3">${code.trim()}</pre>`);

      // Lists
      processed = processed
        .replace(/\\begin\{itemize\}/g, '<ul class="list-disc ml-6 my-2 space-y-1">')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\begin\{enumerate\}/g, '<ol class="list-decimal ml-6 my-2 space-y-1">')
        .replace(/\\end\{enumerate\}/g, '</ol>')
        .replace(/\\begin\{description\}/g, '<dl class="ml-4 my-2">')
        .replace(/\\end\{description\}/g, '</dl>')
        .replace(/\\item\[([^\]]*)\]\s*/g, '<dt class="font-semibold mt-1">$1</dt><dd>')
        .replace(/\\item\s*/g, '<li class="my-1">');

      // Figures & tables (simplified containers)
      processed = processed
        .replace(/\\begin\{(figure|table)\}(\[.*?\])?/g, '<div class="my-4 text-center">')
        .replace(/\\end\{(figure|table)\}/g, '</div>')
        .replace(/\\caption\{([^}]*)\}/g, '<p class="text-sm text-muted-foreground mt-2 italic">$1</p>')
        .replace(/\\includegraphics(\[.*?\])?\{([^}]*)\}/g, '<p class="text-muted-foreground text-sm bg-muted/50 p-4 rounded inline-block">[Image: $2]</p>');

      // Tabular - process rows
      processed = processed.replace(
        /\\begin\{tabular\}\{([^}]*)\}([\s\S]*?)\\end\{tabular\}/g,
        (_, colSpec, tableContent) => {
          const rows = tableContent
            .split('\\\\')
            .map((row: string) => row.trim())
            .filter((row: string) => row && row !== '\\hline' && row !== '\\toprule' && row !== '\\midrule' && row !== '\\bottomrule');
          
          let html = '<table class="border-collapse mx-auto my-3 text-sm"><tbody>';
          rows.forEach((row: string, idx: number) => {
            const cleanRow = row.replace(/\\(hline|toprule|midrule|bottomrule)/g, '').trim();
            if (!cleanRow) return;
            const cells = cleanRow.split('&').map((c: string) => c.trim());
            const tag = idx === 0 ? 'th' : 'td';
            const cellClass = idx === 0 ? 'font-semibold border-b-2 border-foreground/20 px-3 py-1' : 'border-b border-muted px-3 py-1';
            html += '<tr>' + cells.map((c: string) => `<${tag} class="${cellClass}">${c}</${tag}>`).join('') + '</tr>';
          });
          html += '</tbody></table>';
          return html;
        }
      );

      // Display math environments - handle before inline math
      // equation, displaymath
      processed = processed.replace(/\\begin\{(equation|displaymath)\*?\}([\s\S]*?)\\end\{\1\*?\}/g, (_, _env, eq) => 
        `<div class="my-4 text-center overflow-x-auto">${renderMath(eq, true)}</div>`);

      // align, gather, multline, flalign, eqnarray  
      processed = processed.replace(/\\begin\{(align|gather|multline|flalign|eqnarray|aligned|gathered)\*?\}([\s\S]*?)\\end\{\1\*?\}/g, (_, env, eq) => {
        if (env === 'aligned' || env === 'gathered') {
          // These are inner environments, render as-is
          return renderMath(`\\begin{${env}}${eq}\\end{${env}}`, true);
        }
        // Split by \\ and render each line
        const lines = eq.split('\\\\').filter((l: string) => l.trim());
        if (lines.length === 1) {
          return `<div class="my-4 text-center overflow-x-auto">${renderMath(eq.replace(/&/g, '\\quad '), true)}</div>`;
        }
        const rendered = lines.map((line: string) => {
          const cleanLine = line.replace(/&/g, '\\quad ').replace(/\\nonumber|\\notag/g, '').trim();
          return `<div>${renderMath(cleanLine, true)}</div>`;
        }).join('');
        return `<div class="my-4 text-center overflow-x-auto space-y-1">${rendered}</div>`;
      });

      // cases, matrix environments inside math
      processed = processed.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_, eq) => 
        renderMath(`\\begin{cases}${eq}\\end{cases}`, true));
      processed = processed.replace(/\\begin\{(pmatrix|bmatrix|vmatrix|Vmatrix|matrix|Bmatrix|smallmatrix)\}([\s\S]*?)\\end\{\1\}/g, (_, env, eq) => 
        renderMath(`\\begin{${env}}${eq}\\end{${env}}`, true));

      // Display math $$...$$ and \[...\]
      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => 
        `<div class="my-4 text-center overflow-x-auto">${renderMath(eq, true)}</div>`);
      processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => 
        `<div class="my-4 text-center overflow-x-auto">${renderMath(eq, true)}</div>`);

      // Inline math $...$ and \(...\) — be careful not to match $$ 
      processed = processed.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (_, eq) => renderMath(eq, false));
      processed = processed.replace(/\\\((.+?)\\\)/g, (_, eq) => renderMath(eq, false));

      // Text formatting
      processed = processed
        .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
        .replace(/\\texttt\{([^}]*)\}/g, '<code class="bg-muted px-1 rounded text-sm font-mono">$1</code>')
        .replace(/\\underline\{([^}]*)\}/g, '<u>$1</u>')
        .replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/\\textsc\{([^}]*)\}/g, '<span class="uppercase text-sm tracking-wider">$1</span>')
        .replace(/\\textsf\{([^}]*)\}/g, '<span class="font-sans">$1</span>')
        .replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, '$1')
        .replace(/\\colorbox\{[^}]*\}\{([^}]*)\}/g, '<span class="bg-muted px-1 rounded">$1</span>');

      // Font sizes
      processed = processed
        .replace(/\\(tiny|scriptsize|footnotesize|small)\b/g, '')
        .replace(/\\(large|Large|LARGE|huge|Huge)\b/g, '')
        .replace(/\\normalsize/g, '');

      // Misc
      processed = processed
        .replace(/\\footnote\{([^}]*)\}/g, '<sup class="text-primary cursor-help" title="$1">[*]</sup>')
        .replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, '<a href="$1" class="text-primary underline" target="_blank" rel="noopener">$2</a>')
        .replace(/\\url\{([^}]*)\}/g, '<a href="$1" class="text-primary underline text-sm break-all" target="_blank" rel="noopener">$1</a>')
        .replace(/\\centering/g, '')
        .replace(/\\noindent/g, '')
        .replace(/\\bigskip/g, '<div class="my-4"></div>')
        .replace(/\\medskip/g, '<div class="my-2"></div>')
        .replace(/\\smallskip/g, '<div class="my-1"></div>')
        .replace(/\\vspace\*?\{[^}]*\}/g, '<div class="my-2"></div>')
        .replace(/\\hspace\*?\{[^}]*\}/g, '&nbsp;')
        .replace(/\\quad/g, '&emsp;')
        .replace(/\\qquad/g, '&emsp;&emsp;')
        .replace(/\\,/g, '&thinsp;')
        .replace(/\\;/g, '&ensp;')
        .replace(/\\!/g, '')
        .replace(/---/g, '—')
        .replace(/--/g, '–')
        .replace(/``/g, '\u201C')
        .replace(/''/g, '\u201D')
        .replace(/`/g, '\u2018')
        .replace(/'/g, '\u2019')
        .replace(/~/g, '&nbsp;')
        .replace(/\\ldots/g, '…')
        .replace(/\\dots/g, '…')
        .replace(/\\cdots/g, '⋯')
        .replace(/\\textbackslash/g, '\\')
        .replace(/\\%/g, '%')
        .replace(/\\#/g, '#')
        .replace(/\\&/g, '&amp;')
        .replace(/\\_/g, '_')
        .replace(/\\\$/g, '$');

      // Line breaks \\ → <br>
      processed = processed.replace(/\\\\/g, '<br/>');

      // Horizontal rule
      processed = processed.replace(/\\(hrule|rule\{\\textwidth\}\{[^}]*\})/g, '<hr class="my-4"/>');

      // Clean up paragraphs
      processed = processed
        .replace(/\n\n+/g, '</p><p class="my-2">')
        .replace(/\n/g, ' ');

      // Remove remaining unknown commands (be conservative)
      processed = processed.replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?\{[^}]*\}/g, '');
      processed = processed.replace(/\\[a-zA-Z]+\*?/g, '');

      return `<div class="prose prose-sm dark:prose-invert max-w-none"><p class="my-2">${processed}</p></div>`;
    } catch (error) {
      return `<div class="text-destructive p-4">Error rendering LaTeX preview: ${error}</div>`;
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
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Editor and Preview Split */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          {/* Monaco Editor */}
          <Card className="overflow-hidden flex flex-col">
            <CardHeader className="py-2 px-4 border-b flex-row items-center justify-between shrink-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                LaTeX Editor
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 px-2 text-xs">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span className="ml-1 hidden lg:inline">Copy</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadLatex} className="h-7 px-2 text-xs">
                  <Download className="h-3 w-3" />
                  <span className="ml-1 hidden lg:inline">.tex</span>
                </Button>
                {onSave && (
                  <Button variant="ghost" size="sm" onClick={() => onSave(latex)} className="h-7 px-2 text-xs">
                    💾
                    <span className="ml-1 hidden lg:inline">Save</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={resetEditor} className="h-7 px-2 text-xs">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
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
          <Card className="overflow-hidden flex flex-col">
            <CardHeader className="py-2 px-4 border-b shrink-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 min-h-0 overflow-auto">
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