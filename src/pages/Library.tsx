import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, FileText, GraduationCap, Star, Lock, Sparkles, ExternalLink, Filter, Library as LibraryIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ALL_LIBRARY_ITEMS, SUBJECTS } from "@/data/libraryData";

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  type: "book" | "paper" | "program";
  subject: string;
  tags: string[];
  description: string;
  source: string;
  sourceUrl: string;
  year: number;
  coverColor: string;
  premium?: boolean;
}

const Library = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('is_premium').eq('id', user.id).single()
        .then(({ data }) => { if (data) setIsPremium(!!data.is_premium); });
    }
  }, [user]);

  const filteredItems = useMemo(() => {
    return ALL_LIBRARY_ITEMS.filter(item => {
      const matchesTab = activeTab === "all" || item.type === activeTab;
      const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSubject && matchesSearch;
    });
  }, [searchQuery, activeTab, selectedSubject]);

  const counts = useMemo(() => ({
    all: ALL_LIBRARY_ITEMS.length,
    book: ALL_LIBRARY_ITEMS.filter(i => i.type === "book").length,
    paper: ALL_LIBRARY_ITEMS.filter(i => i.type === "paper").length,
    program: ALL_LIBRARY_ITEMS.filter(i => i.type === "program").length,
  }), []);

  const askAI = async () => {
    if (!aiQuestion.trim() || !selectedItem) return;
    if (!isPremium) {
      toast.error("AI Assistant is available for premium users only.");
      return;
    }
    setAiLoading(true);
    setAiResponse("");
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          subject: selectedItem.subject,
          context: `The user is reading "${selectedItem.title}" by ${selectedItem.author}. Description: ${selectedItem.description}. Tags: ${selectedItem.tags.join(', ')}.`,
          messages: [{ role: "user", content: aiQuestion }],
        },
      });
      if (error) throw error;
      setAiResponse(data.response || "No response received.");
    } catch {
      toast.error("Failed to get AI response.");
    } finally {
      setAiLoading(false);
      setAiQuestion("");
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "book": return <BookOpen className="h-4 w-4" />;
      case "paper": return <FileText className="h-4 w-4" />;
      case "program": return <GraduationCap className="h-4 w-4" />;
      default: return null;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "book": return "Textbook";
      case "paper": return "Research Paper";
      case "program": return "School Program";
      default: return type;
    }
  };

  return (
    <AppLayout title="Library" subtitle={`${ALL_LIBRARY_ITEMS.length} resources — Books, research papers & school programs`}>
      {/* Source badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["OpenStax", "arXiv", "Archive.org", "IB Programme", "College Board", "pirateIB", "doxxIB Repository"].map(src => (
          <Badge key={src} variant="outline" className="text-[10px] border-border/40 text-muted-foreground">
            <LibraryIcon className="h-2.5 w-2.5 mr-1" /> {src}
          </Badge>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, topic, or source..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 border-border/40"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Subject:
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-1.5 flex-wrap">
              {SUBJECTS.map(s => (
                <Badge
                  key={s}
                  variant={selectedSubject === s ? "default" : "outline"}
                  className="cursor-pointer text-xs whitespace-nowrap"
                  onClick={() => setSelectedSubject(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="book" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Books ({counts.book})</TabsTrigger>
          <TabsTrigger value="paper" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Papers ({counts.paper})</TabsTrigger>
          <TabsTrigger value="program" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Programs ({counts.program})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            {selectedSubject !== "All" && ` in ${selectedSubject}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="group cursor-pointer border-border/40 hover:border-foreground/20 transition-all duration-300 hover:shadow-lg overflow-hidden"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className={`h-36 bg-gradient-to-br ${item.coverColor} p-4 flex flex-col justify-between relative`}>
                    <div className="flex items-start justify-between">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px]">
                        {typeIcon(item.type)}
                        <span className="ml-1">{typeLabel(item.type)}</span>
                      </Badge>
                      <span className="text-white/60 text-[10px]">{item.year > 0 ? item.year : `${Math.abs(item.year)} BC`}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{item.title}</h3>
                      <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{item.author}</p>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.slice(0, 2).map(t => (
                          <Badge key={t} variant="outline" className="text-[10px] border-border/40">{t}</Badge>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{item.source}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) { setSelectedItem(null); setAiResponse(""); } }}>
        <DialogContent className="max-w-2xl border-border/40">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-18 rounded-lg bg-gradient-to-br ${selectedItem.coverColor} flex items-center justify-center flex-shrink-0 p-3`}>
                    <span className="text-white scale-150">{typeIcon(selectedItem.type)}</span>
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg leading-tight">{selectedItem.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedItem.author} · {selectedItem.year > 0 ? selectedItem.year : `${Math.abs(selectedItem.year)} BC`}
                    </DialogDescription>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Badge variant="secondary">{typeLabel(selectedItem.type)}</Badge>
                      <Badge variant="outline">{selectedItem.subject}</Badge>
                      {selectedItem.tags.map(t => (
                        <Badge key={t} variant="outline" className="text-xs border-border/40">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedItem.description}</p>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Source: </span>
                    <span className="font-medium">{selectedItem.source}</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5" asChild>
                    <a href={selectedItem.sourceUrl} target="_blank" rel="noopener noreferrer">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>

                {/* AI Assistant */}
                <div className="border border-border/40 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">AI Research Assistant</h4>
                    {!isPremium && (
                      <Badge variant="outline" className="ml-auto gap-1 text-xs">
                        <Lock className="h-3 w-3" /> Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ask questions, get summaries, find connections to your research, highlight key concepts, and more.
                  </p>

                  {isPremium ? (
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask about this material..."
                          value={aiQuestion}
                          onChange={e => setAiQuestion(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && askAI()}
                          className="border-border/40"
                        />
                        <Button onClick={askAI} disabled={aiLoading || !aiQuestion.trim()} size="sm">
                          {aiLoading ? "..." : "Ask"}
                        </Button>
                      </div>
                      {aiResponse && (
                        <ScrollArea className="max-h-48">
                          <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                            {aiResponse}
                          </div>
                        </ScrollArea>
                      )}
                    </>
                  ) : (
                    <Button variant="outline" className="w-full gap-2 border-border/40" onClick={() => toast.info("Upgrade to Premium to unlock the AI Research Assistant.")}>
                      <Star className="h-4 w-4" /> Upgrade to Premium
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Library;
