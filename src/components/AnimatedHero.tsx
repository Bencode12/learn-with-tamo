import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const categories = [
  { id: "math", label: "Mathematics", icon: "📐" },
  { id: "science", label: "Sciences", icon: "🔬" },
  { id: "code", label: "Programming", icon: "💻" },
  { id: "language", label: "Languages", icon: "🌍" },
  { id: "history", label: "History", icon: "📜" },
  { id: "arts", label: "Arts", icon: "🎨" },
];

export const AnimatedHero = () => {
  return (
    <section className="relative min-h-screen bg-background">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
                <span className="text-background font-bold text-lg">K</span>
              </div>
              <span className="font-semibold text-xl text-foreground tracking-tight">KnowIt AI</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/gamemodes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Learning
              </Link>
              <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
              <Link to="/store" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Premium
              </Link>
              <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-5">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight leading-[0.95] mb-8">
            The Future of
            <br />
            Learning. AI-Powered.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Master any subject with personalized AI lessons that adapt to your unique learning style. 
            No subscriptions. No limits. Just learning.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/signup">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 text-base font-medium">
                Start Learning Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/gamemodes">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-medium border-border/50 hover:bg-muted/50">
                Explore Subjects
              </Button>
            </Link>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="flex items-center gap-2 px-5 py-2.5 bg-muted/50 hover:bg-muted border border-border/50 rounded-full text-sm font-medium text-foreground transition-all hover:scale-105"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
    </section>
  );
};
