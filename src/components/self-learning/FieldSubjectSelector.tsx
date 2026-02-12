import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Search } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const subjects: Subject[] = [
  // Mathematics
  { id: "algebra", name: "Algebra", icon: "📐", description: "Equations, functions, and algebraic structures", category: "Mathematics", difficulty: "beginner" },
  { id: "calculus", name: "Calculus", icon: "📐", description: "Limits, derivatives, and integrals", category: "Mathematics", difficulty: "intermediate" },
  { id: "linear-algebra", name: "Linear Algebra", icon: "📐", description: "Vectors, matrices, and linear transformations", category: "Mathematics", difficulty: "intermediate" },
  { id: "statistics", name: "Statistics & Probability", icon: "📐", description: "Data analysis and probability theory", category: "Mathematics", difficulty: "beginner" },
  { id: "discrete-math", name: "Discrete Mathematics", icon: "📐", description: "Logic, sets, and combinatorics", category: "Mathematics", difficulty: "intermediate" },
  { id: "number-theory", name: "Number Theory", icon: "📐", description: "Properties and relationships of integers", category: "Mathematics", difficulty: "advanced" },
  // Physics
  { id: "classical-mechanics", name: "Classical Mechanics", icon: "⚛️", description: "Motion, forces, and energy", category: "Physics", difficulty: "beginner" },
  { id: "electromagnetism", name: "Electromagnetism", icon: "⚛️", description: "Electric and magnetic phenomena", category: "Physics", difficulty: "intermediate" },
  { id: "thermodynamics", name: "Thermodynamics", icon: "⚛️", description: "Heat, energy, and entropy", category: "Physics", difficulty: "intermediate" },
  { id: "quantum-mechanics", name: "Quantum Mechanics", icon: "⚛️", description: "Behavior of matter at atomic scales", category: "Physics", difficulty: "advanced" },
  // Chemistry
  { id: "general-chemistry", name: "General Chemistry", icon: "🧪", description: "Fundamental chemical principles", category: "Chemistry", difficulty: "beginner" },
  { id: "organic-chemistry", name: "Organic Chemistry", icon: "🧪", description: "Carbon-based compounds", category: "Chemistry", difficulty: "intermediate" },
  { id: "biochemistry", name: "Biochemistry", icon: "🧪", description: "Chemistry of living organisms", category: "Chemistry", difficulty: "intermediate" },
  // Computer Science
  { id: "programming-fundamentals", name: "Programming", icon: "💻", description: "Core programming concepts", category: "Computer Science", difficulty: "beginner" },
  { id: "data-structures", name: "Data Structures", icon: "💻", description: "Organizing and storing data", category: "Computer Science", difficulty: "intermediate" },
  { id: "algorithms", name: "Algorithms", icon: "💻", description: "Problem-solving techniques", category: "Computer Science", difficulty: "intermediate" },
  { id: "machine-learning", name: "Machine Learning", icon: "💻", description: "AI and pattern recognition", category: "Computer Science", difficulty: "advanced" },
  // Biology
  { id: "cell-biology", name: "Cell Biology", icon: "🧬", description: "Structure and function of cells", category: "Biology", difficulty: "beginner" },
  { id: "genetics", name: "Genetics", icon: "🧬", description: "Heredity and gene expression", category: "Biology", difficulty: "intermediate" },
  { id: "neuroscience", name: "Neuroscience", icon: "🧬", description: "The nervous system and brain", category: "Biology", difficulty: "advanced" },
  // Languages
  { id: "spanish", name: "Spanish", icon: "🌍", description: "Spanish language and culture", category: "Languages", difficulty: "beginner" },
  { id: "french", name: "French", icon: "🌍", description: "French language and culture", category: "Languages", difficulty: "beginner" },
  { id: "german", name: "German", icon: "🌍", description: "German language and culture", category: "Languages", difficulty: "intermediate" },
  { id: "mandarin", name: "Mandarin Chinese", icon: "🌍", description: "Mandarin language and culture", category: "Languages", difficulty: "advanced" },
  // History
  { id: "world-history", name: "World History", icon: "📜", description: "Major events and civilizations", category: "History", difficulty: "beginner" },
  { id: "european-history", name: "European History", icon: "📜", description: "History of Europe", category: "History", difficulty: "intermediate" },
  // Arts
  { id: "music-theory", name: "Music Theory", icon: "🎵", description: "Fundamentals of music", category: "Arts", difficulty: "beginner" },
  { id: "art-history", name: "Art History", icon: "🎨", description: "Visual arts through the ages", category: "Arts", difficulty: "beginner" },
];

interface FieldSubjectSelectorProps {
  onSelect: (field: { id: string; name: string; icon: string; description: string; subjects: any[] }, subject: { id: string; name: string; description: string; difficulty: string }) => void;
}

export const FieldSubjectSelector = ({ onSelect }: FieldSubjectSelectorProps) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(subjects.map(s => s.category))];

  const filtered = subjects.filter(s => {
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "intermediate": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "advanced": return "bg-red-500/10 text-red-600 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleSelect = (subject: Subject) => {
    // Create a compatible field object from the subject's category
    const field = {
      id: subject.category.toLowerCase().replace(/\s+/g, '-'),
      name: subject.category,
      icon: subject.icon,
      description: subject.category,
      subjects: []
    };
    onSelect(field, {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      difficulty: subject.difficulty
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose a Subject</h2>
        <p className="text-muted-foreground">Select a subject to open your workspace</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Subject grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((subject) => (
          <Card
            key={subject.id}
            className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
            onClick={() => handleSelect(subject)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{subject.icon}</span>
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {subject.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{subject.category}</p>
                  </div>
                </div>
                <Badge className={getDifficultyColor(subject.difficulty)} variant="secondary">
                  {subject.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{subject.description}</p>
              <Button size="sm" className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Open Workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No subjects found</p>
        </div>
      )}
    </div>
  );
};
