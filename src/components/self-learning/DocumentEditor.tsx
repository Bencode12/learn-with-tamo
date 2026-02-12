import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Download, Type } from "lucide-react";

interface DocumentEditorProps {
  subject: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export const DocumentEditor = ({ subject, initialContent = "", onSave }: DocumentEditorProps) => {
  const [title, setTitle] = useState(`${subject} - Document`);
  const [content, setContent] = useState(initialContent);

  const handleExport = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(JSON.stringify({ title, content }));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Underline className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8"><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ListOrdered className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button variant="ghost" size="icon" className="h-8 w-8"><AlignLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><AlignCenter className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><AlignRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1" />
        {onSave && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
            <Download className="h-4 w-4" />
            Save
          </Button>
        )}
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Document area */}
      <div className="flex-1 overflow-auto p-8 bg-muted/10">
        <Card className="max-w-3xl mx-auto min-h-[600px] p-8 shadow-sm">
          <input
            className="text-2xl font-bold w-full border-none outline-none bg-transparent mb-4 placeholder:text-muted-foreground/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
          />
          <Textarea
            className="min-h-[500px] border-none shadow-none resize-none text-base leading-relaxed bg-transparent focus-visible:ring-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
          />
        </Card>
      </div>
    </div>
  );
};
