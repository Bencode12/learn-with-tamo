import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, ArrowLeft, ArrowRight, RotateCcw, Home, 
  ExternalLink, Music, BookOpen, Search, Youtube,
  Newspaper, Code, GraduationCap
} from "lucide-react";

interface QuickLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  category: string;
}

const quickLinks: QuickLink[] = [
  // Learning
  { name: "Wikipedia", url: "https://wikipedia.org", icon: <BookOpen className="h-4 w-4" />, category: "Learning" },
  { name: "Khan Academy", url: "https://khanacademy.org", icon: <GraduationCap className="h-4 w-4" />, category: "Learning" },
  { name: "Wolfram Alpha", url: "https://wolframalpha.com", icon: <Search className="h-4 w-4" />, category: "Learning" },
  { name: "arXiv", url: "https://arxiv.org", icon: <Newspaper className="h-4 w-4" />, category: "Learning" },
  
  // Music
  { name: "Spotify", url: "https://open.spotify.com", icon: <Music className="h-4 w-4" />, category: "Music" },
  { name: "YouTube Music", url: "https://music.youtube.com", icon: <Youtube className="h-4 w-4" />, category: "Music" },
  { name: "SoundCloud", url: "https://soundcloud.com", icon: <Music className="h-4 w-4" />, category: "Music" },
  
  // Reference
  { name: "Stack Overflow", url: "https://stackoverflow.com", icon: <Code className="h-4 w-4" />, category: "Reference" },
  { name: "MDN Web Docs", url: "https://developer.mozilla.org", icon: <Code className="h-4 w-4" />, category: "Reference" },
  { name: "Google Scholar", url: "https://scholar.google.com", icon: <GraduationCap className="h-4 w-4" />, category: "Reference" },
];

interface WebBrowserProps {
  subject: string;
}

export const WebBrowser = ({ subject }: WebBrowserProps) => {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const normalizeUrl = (input: string): string => {
    let normalized = input.trim();
    
    // If it looks like a search query, use DuckDuckGo
    if (!normalized.includes(".") || normalized.includes(" ")) {
      return `https://duckduckgo.com/?q=${encodeURIComponent(normalized)}`;
    }
    
    // Add https if no protocol
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = `https://${normalized}`;
    }
    
    return normalized;
  };

  const navigate = (targetUrl: string) => {
    const normalizedUrl = normalizeUrl(targetUrl);
    setCurrentUrl(normalizedUrl);
    setUrl(normalizedUrl);
    setIsLoading(true);
    
    // Update history
    const newHistory = [...history.slice(0, historyIndex + 1), normalizedUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      navigate(url);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setCurrentUrl(prevUrl);
      setUrl(prevUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setCurrentUrl(nextUrl);
      setUrl(nextUrl);
    }
  };

  const refresh = () => {
    if (iframeRef.current && currentUrl) {
      iframeRef.current.src = currentUrl;
      setIsLoading(true);
    }
  };

  const goHome = () => {
    setCurrentUrl("");
    setUrl("");
  };

  const openExternal = () => {
    if (currentUrl) {
      window.open(currentUrl, "_blank");
    }
  };

  const categories = [...new Set(quickLinks.map(l => l.category))];

  return (
    <div className="h-full flex flex-col">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          disabled={historyIndex <= 0}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goForward}
          disabled={historyIndex >= history.length - 1}
          className="h-8 w-8"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={refresh}
          disabled={!currentUrl}
          className="h-8 w-8"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goHome}
          className="h-8 w-8"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search or enter URL..."
              className="pl-9 h-8"
            />
          </div>
          <Button type="submit" size="sm" className="h-8">
            Go
          </Button>
        </form>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={openExternal}
          disabled={!currentUrl}
          className="h-8 w-8"
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {currentUrl ? (
          <div className="w-full h-full relative">
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              title="Web Browser"
            />
            {/* Fallback for blocked sites */}
            <div className="absolute bottom-0 left-0 right-0 bg-muted/80 backdrop-blur-sm border-t p-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">
                {currentUrl}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1 shrink-0"
                onClick={openExternal}
              >
                <ExternalLink className="h-3 w-3" />
                Open in new tab
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="text-center mb-8">
                <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-1">Web Browser</h2>
                <p className="text-muted-foreground text-sm">
                  Search the web or use quick links below
                </p>
              </div>

              {/* Quick Links by Category */}
              <div className="space-y-6 max-w-3xl mx-auto">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {quickLinks
                        .filter((link) => link.category === category)
                        .map((link) => (
                          <Card
                            key={link.url}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => navigate(link.url)}
                          >
                            <CardContent className="p-3 flex items-center gap-2">
                              {link.icon}
                              <span className="text-sm truncate">{link.name}</span>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subject-specific suggestion */}
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate(`${subject} tutorial`)}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search for {subject} tutorials
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
