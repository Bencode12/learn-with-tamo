import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Download } from "lucide-react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  subject: string;
}

const languageTemplates: Record<string, { language: string; template: string }> = {
  python: {
    language: "python",
    template: `# ${''} Python Workspace\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n`
  },
  javascript: {
    language: "javascript",
    template: `// JavaScript Workspace\n\nfunction main() {\n  console.log("Hello, World!");\n}\n\nmain();\n`
  },
  typescript: {
    language: "typescript",
    template: `// TypeScript Workspace\n\nfunction main(): void {\n  console.log("Hello, World!");\n}\n\nmain();\n`
  },
  java: {
    language: "java",
    template: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`
  },
  cpp: {
    language: "cpp",
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`
  },
  html: {
    language: "html",
    template: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n`
  }
};

export const CodeEditor = ({ subject }: CodeEditorProps) => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(languageTemplates.python.template);
  const [output, setOutput] = useState("");

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(languageTemplates[lang]?.template || "");
  };

  const handleRun = () => {
    setOutput(`[Code execution preview not available in browser]\n\nLanguage: ${language}\nLines: ${code.split('\n').length}`);
  };

  const handleExport = () => {
    const ext: Record<string, string> = { python: 'py', javascript: 'js', typescript: 'ts', java: 'java', cpp: 'cpp', html: 'html' };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workspace.${ext[language] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-40 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-2" onClick={handleRun}>
          <Play className="h-4 w-4" />
          Run
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Editor + Output */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={languageTemplates[language]?.language || language}
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
            }}
          />
        </div>
        {output && (
          <div className="w-80 border-l bg-muted/20 p-3 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Output</span>
              <Button variant="ghost" size="sm" onClick={() => setOutput("")}>Clear</Button>
            </div>
            <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
