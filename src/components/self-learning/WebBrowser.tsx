import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, ArrowLeft, ArrowRight, RotateCcw, Home, 
  ExternalLink, Music, BookOpen, Search, Youtube,
  Newspaper, Code, GraduationCap, AlertTriangle
} from "lucide-react";

interface QuickLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  category: string;
}

const quickLinks: QuickLink[] = [
  { name: "Wikipedia", url: "https://en.wikipedia.org", icon: <BookOpen className="h-4 w-4" />, category: "Learning" },
  { name: "Khan Academy", url: "https://khanacademy.org", icon: <GraduationCap className="h-4 w-4" />, category: "Learning" },
  { name: "Wolfram Alpha", url: "https://wolframalpha.com", icon: <Search className="h-4 w-4" />, category: "Learning" },
  { name: "arXiv", url: "https://arxiv.org", icon: <Newspaper className="h-4 w-4" />, category: "Learning" },
  { name: "Spotify", url: "https://open.spotify.com", icon: <Music className="h-4 w-4" />, category: "Music" },
  { name: "YouTube Music", url: "https://music.youtube.com", icon: <Youtube className="h-4 w-4" />, category: "Music" },
  { name: "SoundCloud", url: "https://soundcloud.com", icon: <Music className="h-4 w-4" />, category: "Music" },
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
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizeUrl = (input: string): string => {
    let normalized = input.trim();
    if (!normalized.includes(".") || normalized.includes(" ")) {
      return `https://duckduckgo.com/?q=${encodeURIComponent(normalized)}`;
    }
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  };

  const navigate = useCallback((targetUrl: string) => {
    const normalizedUrl = normalizeUrl(targetUrl);
    
    // Always try to load in iframe - show fallback if it fails
    setIframeBlocked(false);
    setCurrentUrl(normalizedUrl);
    setUrl(normalizedUrl);
    setIsLoading(true);

    // Timeout: if iframe hasn't loaded in 10s, assume blocked
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setIframeBlocked(true);
    }, 10000);

    const newHistory = [...history.slice(0, historyIndex + 1), normalizedUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) navigate(url);
  };

  const handleIframeLoad = () => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setIsLoading(false);
    setIframeBlocked(false);
  };

  const handleIframeError = () => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setIsLoading(false);
    setIframeBlocked(true);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
      setIframeBlocked(false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
      setIframeBlocked(false);
    }
  };

  const refresh = () => {
    if (iframeRef.current && currentUrl) {
      setIframeBlocked(false);
      setIsLoading(true);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setIframeBlocked(true);
      }, 10000);
      iframeRef.current.src = currentUrl;
    }
  };

  const goHome = () => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setCurrentUrl("");
    setUrl("");
    setIframeBlocked(false);
    setIsLoading(false);
  };

  const openExternal = (externalUrl?: string) => {
    const target = externalUrl || currentUrl;
    if (target) window.open(target, "_blank", "noopener,noreferrer");
  };

  const categories = [...new Set(quickLinks.map(l => l.category))];

  return (
    <div className="h-full flex flex-col">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <Button variant="ghost" size="icon" onClick={goBack} disabled={historyIndex <= 0} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={goForward} disabled={historyIndex >= history.length - 1} className="h-8 w-8">
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={!currentUrl} className="h-8 w-8">
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
        <Button variant="ghost" size="icon" onClick={goHome} className="h-8 w-8">
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
          <Button type="submit" size="sm" className="h-8">Go</Button>
        </form>
        
        <Button variant="ghost" size="icon" onClick={() => openExternal()} disabled={!currentUrl} className="h-8 w-8" title="Open in new tab">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {currentUrl ? (
          <div className="w-full h-full relative">
            {iframeBlocked ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Can't display this page inline</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  This website blocks embedding. You can open it in a new browser tab instead.
                </p>
                <Button onClick={() => openExternal()} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </Button>
                <Button variant="outline" onClick={goHome} size="sm">
                  Go back home
                </Button>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                title="Web Browser"
              />
            )}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="text-center mb-8">
                <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-1">Web Browser</h2>
                <p className="text-muted-foreground text-sm">
                  Browse the web inline. Some sites may block embedding — use "Open in new tab" as fallback.
                </p>
              </div>

              {categories.map((category) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{category}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {quickLinks.filter((link) => link.category === category).map((link) => (
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

              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => navigate(`${subject} tutorial`)} className="gap-2">
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