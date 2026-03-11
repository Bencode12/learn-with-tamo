import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, BookOpen, BarChart3, Users, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import previewMath from "@/assets/preview-math.jpg";
import previewScience from "@/assets/preview-science.jpg";
import previewCode from "@/assets/preview-code.jpg";
import previewLanguage from "@/assets/preview-language.jpg";
import previewHistory from "@/assets/preview-history.jpg";
import previewArts from "@/assets/preview-arts.jpg";

const categories = [
  { 
    id: "math", label: "Mathematics", icon: "📐", image: previewMath,
    description: "Master algebra, calculus, and geometry through interactive games like Math Tic-Tac-Toe, timed challenges, and AI-generated problem sets.",
    features: ["Tic-Tac-Toe Math Battles", "Step-by-step Solutions", "Adaptive Difficulty"],
  },
  { 
    id: "science", label: "Sciences", icon: "🔬", image: previewScience,
    description: "Explore chemistry, physics, and biology with interactive molecular diagrams, virtual experiments, and visual learning tools.",
    features: ["Interactive Experiments", "Visual Diagrams", "Lab Simulations"],
  },
  { 
    id: "code", label: "Programming", icon: "💻", image: previewCode,
    description: "Learn Python, JavaScript, and more with an integrated code editor, real-time feedback, and project-based challenges.",
    features: ["Built-in Code Editor", "Real-time Feedback", "Project Challenges"],
  },
  { 
    id: "language", label: "Languages", icon: "🌍", image: previewLanguage,
    description: "Pick up new languages with flashcards, translation exercises, conversation practice, and spaced repetition learning.",
    features: ["Flashcard System", "Translation Drills", "Conversation Practice"],
  },
  { 
    id: "history", label: "History", icon: "📜", image: previewHistory,
    description: "Journey through time with interactive timelines, historical event exploration, map-based learning, and engaging quizzes.",
    features: ["Interactive Timelines", "Map Exploration", "Era Deep-dives"],
  },
  { 
    id: "arts", label: "Arts", icon: "🎨", image: previewArts,
    description: "Discover art history, music theory, and creative expression through visual galleries, composition tools, and guided courses.",
    features: ["Art History Galleries", "Music Theory", "Creative Tools"],
  },
];

export const AnimatedHero = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cardPosition, setCardPosition] = useState<{ x: number; side: 'left' | 'right' | 'center' }>({ x: 0, side: 'center' });
  const pillsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (catId: string, e: React.MouseEvent) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const pill = e.currentTarget as HTMLElement;
    const rect = pill.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const pillCenter = rect.left + rect.width / 2;
    
    let side: 'left' | 'right' | 'center' = 'center';
    if (pillCenter < windowWidth * 0.35) side = 'left';
    else if (pillCenter > windowWidth * 0.65) side = 'right';
    
    setCardPosition({ x: pillCenter, side });
    setActiveCategory(catId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 200);
  };

  const handleCardEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleCardLeave = () => {
    setActiveCategory(null);
  };

  const activeCat = categories.find(c => c.id === activeCategory);

  return (
    <section className="relative min-h-screen bg-background">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
                <span className="text-background font-bold text-lg">K</span>
              </div>
              <span className="font-semibold text-xl text-foreground tracking-tight">KnowIt AI</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link to="/signup">
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-5">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight leading-[0.95] mb-8">
            The Future of
            <br />
            Learning. AI-Powered.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Master any subject with personalized AI lessons that adapt to your unique learning style. 
            No subscriptions. No limits. Just learning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/signup">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 text-base font-medium">
                Start Learning Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Category Pills with Hover Cards */}
          <div className="relative" ref={pillsRef}>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onMouseEnter={(e) => handleMouseEnter(cat.id, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`flex items-center gap-2 px-5 py-2.5 border rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-foreground text-background border-foreground scale-110 shadow-lg'
                      : 'bg-muted/50 hover:bg-muted border-border/50 text-foreground hover:scale-105'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Hover Preview Card */}
            {activeCat && (
              <div
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
                className="absolute z-50 mt-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
                style={{
                  left: cardPosition.side === 'center' ? '50%' : cardPosition.side === 'left' ? '5%' : 'auto',
                  right: cardPosition.side === 'right' ? '5%' : 'auto',
                  transform: cardPosition.side === 'center' ? 'translateX(-50%)' : 'none',
                  width: 'min(520px, 90vw)',
                }}
              >
                <div className="bg-background border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={activeCat.image} 
                      alt={activeCat.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <span className="text-2xl">{activeCat.icon}</span>
                      <h3 className="text-lg font-bold text-foreground">{activeCat.label}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {activeCat.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {activeCat.features.map((feat, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-muted/60 rounded-full text-foreground/80"
                        >
                          <Sparkles className="h-3 w-3" />
                          {feat}
                        </span>
                      ))}
                    </div>

                    <Link to="/signup">
                      <Button size="sm" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-lg gap-2">
                        Try {activeCat.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gradient Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
    </section>
  );
};
