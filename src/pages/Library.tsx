import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, BookOpen, FileText, GraduationCap, Star, Lock, Sparkles, ExternalLink, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LibraryItem {
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

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Literature", "History", "Economics", "Philosophy"];

const LIBRARY_ITEMS: LibraryItem[] = [
  // Research papers (Arxiv-style)
  { id: "p1", title: "Attention Is All You Need", author: "Vaswani et al.", type: "paper", subject: "Computer Science", tags: ["AI", "Transformers", "NLP"], description: "The foundational paper introducing the Transformer architecture that revolutionized natural language processing and beyond.", source: "arXiv", sourceUrl: "https://arxiv.org/abs/1706.03762", year: 2017, coverColor: "from-blue-600 to-indigo-700" },
  { id: "p2", title: "A Mathematical Theory of Communication", author: "Claude Shannon", type: "paper", subject: "Mathematics", tags: ["Information Theory", "Entropy"], description: "The seminal paper that founded information theory, introducing concepts of entropy, channel capacity, and coding.", source: "Bell System", sourceUrl: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf", year: 1948, coverColor: "from-emerald-600 to-teal-700" },
  { id: "p3", title: "Deep Residual Learning for Image Recognition", author: "He et al.", type: "paper", subject: "Computer Science", tags: ["Deep Learning", "CNN", "ResNet"], description: "Introduced residual connections enabling training of very deep neural networks, winning ILSVRC 2015.", source: "arXiv", sourceUrl: "https://arxiv.org/abs/1512.03385", year: 2015, coverColor: "from-violet-600 to-purple-700" },
  { id: "p4", title: "The Unreasonable Effectiveness of Mathematics", author: "Eugene Wigner", type: "paper", subject: "Physics", tags: ["Philosophy of Science", "Mathematics"], description: "A classic essay exploring why mathematics is so remarkably useful in the natural sciences.", source: "Communications in Pure and Applied Mathematics", sourceUrl: "https://www.maths.ed.ac.uk/~v1ranick/papers/wigner.pdf", year: 1960, coverColor: "from-amber-600 to-orange-700" },
  { id: "p5", title: "CRISPR-Cas9: A Revolutionary Tool for Genome Editing", author: "Doudna & Charpentier", type: "paper", subject: "Biology", tags: ["Genetics", "CRISPR", "Biotechnology"], description: "The breakthrough paper describing the CRISPR-Cas9 system for precise genome editing.", source: "Science", sourceUrl: "https://www.science.org/doi/10.1126/science.1258096", year: 2014, coverColor: "from-green-600 to-emerald-700" },
  { id: "p6", title: "On the Electrodynamics of Moving Bodies", author: "Albert Einstein", type: "paper", subject: "Physics", tags: ["Relativity", "Special Relativity"], description: "Einstein's foundational paper introducing special relativity, fundamentally changing our understanding of space and time.", source: "Annalen der Physik", sourceUrl: "https://www.fourmilab.ch/etexts/einstein/specrel/specrel.pdf", year: 1905, coverColor: "from-sky-600 to-blue-700" },
  { id: "p7", title: "Computing Machinery and Intelligence", author: "Alan Turing", type: "paper", subject: "Computer Science", tags: ["AI", "Turing Test", "Philosophy"], description: "Turing's famous paper proposing the imitation game (Turing Test) as a measure of machine intelligence.", source: "Mind", sourceUrl: "https://academic.oup.com/mind/article/LIX/236/433/986238", year: 1950, coverColor: "from-rose-600 to-pink-700" },
  { id: "p8", title: "The Structure of Scientific Revolutions", author: "Thomas Kuhn", type: "paper", subject: "Philosophy", tags: ["Philosophy of Science", "Paradigm Shift"], description: "Introduced the concept of paradigm shifts in scientific progress, one of the most cited academic works.", source: "University of Chicago Press", sourceUrl: "https://www.lri.fr/~mbl/Stanford/CS477/papers/Kuhn-SSR-2ndEd.pdf", year: 1962, coverColor: "from-slate-600 to-gray-700" },

  // Books (open-access textbooks)
  { id: "b1", title: "Linear Algebra Done Right", author: "Sheldon Axler", type: "book", subject: "Mathematics", tags: ["Linear Algebra", "Textbook"], description: "A rigorous yet accessible introduction to linear algebra focusing on vector spaces rather than matrices.", source: "Springer Open", sourceUrl: "https://linear.axler.net/", year: 2024, coverColor: "from-cyan-600 to-blue-700" },
  { id: "b2", title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest, Stein", type: "book", subject: "Computer Science", tags: ["Algorithms", "Data Structures"], description: "The definitive textbook on algorithms, covering a broad range of topics in depth.", source: "MIT Press", sourceUrl: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/", year: 2022, coverColor: "from-red-600 to-rose-700" },
  { id: "b3", title: "The Feynman Lectures on Physics", author: "Richard Feynman", type: "book", subject: "Physics", tags: ["Classical Mechanics", "Quantum Mechanics", "Electromagnetism"], description: "Feynman's legendary undergraduate physics lectures, freely available online.", source: "Caltech", sourceUrl: "https://www.feynmanlectures.caltech.edu/", year: 1964, coverColor: "from-orange-600 to-amber-700" },
  { id: "b4", title: "Organic Chemistry", author: "John McMurry", type: "book", subject: "Chemistry", tags: ["Organic Chemistry", "Textbook"], description: "A comprehensive introduction to organic chemistry with clear explanations and extensive problem sets.", source: "Cengage", sourceUrl: "https://www.cengage.com/c/organic-chemistry-9e-mcmurry/", year: 2016, coverColor: "from-teal-600 to-green-700" },
  { id: "b5", title: "Molecular Biology of the Cell", author: "Alberts et al.", type: "book", subject: "Biology", tags: ["Cell Biology", "Molecular Biology"], description: "The gold standard textbook for understanding cellular and molecular biology.", source: "Garland Science", sourceUrl: "https://www.ncbi.nlm.nih.gov/books/NBK21054/", year: 2022, coverColor: "from-lime-600 to-green-700" },
  { id: "b6", title: "Principles of Economics", author: "N. Gregory Mankiw", type: "book", subject: "Economics", tags: ["Microeconomics", "Macroeconomics"], description: "The most widely used economics textbook, covering fundamental micro and macro principles.", source: "Cengage", sourceUrl: "https://www.cengage.com/c/principles-of-economics-9e-mankiw/", year: 2021, coverColor: "from-yellow-600 to-amber-700" },
  { id: "b7", title: "Calculus: Early Transcendentals", author: "James Stewart", type: "book", subject: "Mathematics", tags: ["Calculus", "Analysis"], description: "The leading calculus textbook known for its clarity, problem quality, and visualization.", source: "Cengage", sourceUrl: "https://www.cengage.com/c/calculus-early-transcendentals-9e-stewart/", year: 2020, coverColor: "from-indigo-600 to-violet-700" },

  // School program resources (IB, AP, A-Level)
  { id: "s1", title: "IB Mathematics: Analysis & Approaches HL", author: "IB Organization", type: "program", subject: "Mathematics", tags: ["IB", "HL", "Analysis"], description: "Complete syllabus guide and resources for IB Math AA Higher Level, covering calculus, algebra, and statistics.", source: "IB Programme", sourceUrl: "https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/", year: 2024, coverColor: "from-blue-500 to-sky-600" },
  { id: "s2", title: "IB Physics HL", author: "IB Organization", type: "program", subject: "Physics", tags: ["IB", "HL", "Mechanics"], description: "Full IB Physics Higher Level curriculum with experimental labs, theory, and internal assessment guidance.", source: "IB Programme", sourceUrl: "https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/", year: 2024, coverColor: "from-purple-500 to-indigo-600" },
  { id: "s3", title: "AP Computer Science A", author: "College Board", type: "program", subject: "Computer Science", tags: ["AP", "Java", "OOP"], description: "AP CS A syllabus covering object-oriented programming, algorithms, and data structures in Java.", source: "College Board", sourceUrl: "https://apstudents.collegeboard.org/courses/ap-computer-science-a", year: 2024, coverColor: "from-green-500 to-teal-600" },
  { id: "s4", title: "A-Level Chemistry (AQA)", author: "AQA", type: "program", subject: "Chemistry", tags: ["A-Level", "AQA", "Organic"], description: "Complete A-Level Chemistry specification covering physical, organic, and inorganic chemistry.", source: "AQA", sourceUrl: "https://www.aqa.org.uk/subjects/science/a-level/chemistry-7405", year: 2024, coverColor: "from-pink-500 to-rose-600" },
  { id: "s5", title: "IB Biology HL", author: "IB Organization", type: "program", subject: "Biology", tags: ["IB", "HL", "Ecology"], description: "IB Biology Higher Level covering cell biology, genetics, ecology, evolution, and human physiology.", source: "IB Programme", sourceUrl: "https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/", year: 2024, coverColor: "from-emerald-500 to-green-600" },
  { id: "s6", title: "AP Calculus BC", author: "College Board", type: "program", subject: "Mathematics", tags: ["AP", "Calculus", "Series"], description: "AP Calculus BC covering limits, derivatives, integrals, parametric equations, polar coordinates, and series.", source: "College Board", sourceUrl: "https://apstudents.collegeboard.org/courses/ap-calculus-bc", year: 2024, coverColor: "from-amber-500 to-yellow-600" },
  { id: "s7", title: "IB Economics HL", author: "IB Organization", type: "program", subject: "Economics", tags: ["IB", "HL", "Microeconomics"], description: "IB Economics Higher Level syllabus covering micro, macro, international, and development economics.", source: "IB Programme", sourceUrl: "https://www.ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/", year: 2024, coverColor: "from-orange-500 to-red-600" },
  { id: "s8", title: "A-Level Mathematics (Edexcel)", author: "Pearson Edexcel", type: "program", subject: "Mathematics", tags: ["A-Level", "Edexcel", "Pure Math"], description: "Edexcel A-Level Maths specification covering pure mathematics, statistics, and mechanics.", source: "Edexcel", sourceUrl: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html", year: 2024, coverColor: "from-cyan-500 to-blue-600" },
];

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

  // Check premium status
  useState(() => {
    if (user) {
      supabase.from('profiles').select('is_premium').eq('id', user.id).single()
        .then(({ data }) => { if (data) setIsPremium(!!data.is_premium); });
    }
  });

  const filteredItems = useMemo(() => {
    return LIBRARY_ITEMS.filter(item => {
      const matchesTab = activeTab === "all" || item.type === activeTab;
      const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSubject && matchesSearch;
    });
  }, [searchQuery, activeTab, selectedSubject]);

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
    <AppLayout title="Library" subtitle="Books, research papers & school program resources">
      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or topic..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 border-border/40"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Subject:
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {SUBJECTS.map(s => (
              <Badge
                key={s}
                variant={selectedSubject === s ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedSubject(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({LIBRARY_ITEMS.length})</TabsTrigger>
          <TabsTrigger value="book" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Books</TabsTrigger>
          <TabsTrigger value="paper" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Papers</TabsTrigger>
          <TabsTrigger value="program" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Programs</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
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
                  {/* Cover */}
                  <div className={`h-40 bg-gradient-to-br ${item.coverColor} p-5 flex flex-col justify-between relative`}>
                    <div className="flex items-start justify-between">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px]">
                        {typeIcon(item.type)}
                        <span className="ml-1">{typeLabel(item.type)}</span>
                      </Badge>
                      <span className="text-white/60 text-xs">{item.year}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{item.title}</h3>
                      <p className="text-white/70 text-xs mt-1">{item.author}</p>
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
                  <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${selectedItem.coverColor} flex items-center justify-center flex-shrink-0`}>
                    {typeIcon(selectedItem.type) && <span className="text-white scale-150">{typeIcon(selectedItem.type)}</span>}
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg leading-tight">{selectedItem.title}</DialogTitle>
                    <DialogDescription className="mt-1">{selectedItem.author} · {selectedItem.year}</DialogDescription>
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

                {/* AI Assistant Section */}
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
                    Ask questions about this material, get summaries, find connections to your research, and more.
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
