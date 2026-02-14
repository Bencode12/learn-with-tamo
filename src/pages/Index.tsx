import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Brain, Target, TrendingUp, Trophy, Users, Zap, 
  ArrowRight, CheckCircle2, Globe, Shield,
  Calculator, Beaker, BookOpen, Palette, Music, Globe2
} from "lucide-react";
import { AnimatedHero } from "@/components/AnimatedHero";
import { useState } from "react";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized lessons that adapt to your learning pace and style in real-time.",
    },
    {
      icon: Target,
      title: "Smart Assessments",
      description: "Comprehensive evaluations that pinpoint your strengths and growth areas.",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Detailed insights to track your journey and celebrate every milestone.",
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Earn XP, unlock achievements, and stay motivated through friendly competition.",
    },
  ];

  const stats = [
    { value: "10M+", label: "Active Learners" },
    { value: "500+", label: "Courses Available" },
    { value: "95%", label: "Completion Rate" },
    { value: "4.9", label: "User Rating" },
  ];

  const useCases = [
    {
      title: "Academic Excellence",
      description: "From high school to university, master any subject with AI-guided learning paths tailored to your curriculum.",
      image: "📚",
    },
    {
      title: "Career Development",
      description: "Upskill for your next promotion or pivot to a new field with industry-relevant courses and certifications.",
      image: "💼",
    },
    {
      title: "Lifelong Learning",
      description: "Explore new hobbies, languages, and skills at your own pace with no pressure and full flexibility.",
      image: "🎯",
    },
  ];



  return (
    <div className="min-h-screen bg-background">
      <AnimatedHero />

      {/* Stats Section */}
      <section className="py-20 px-6 border-b border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
              Everything you need to learn smarter, not harder.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform combines cutting-edge AI with proven learning methodologies to deliver an experience that's both effective and enjoyable.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-muted/30 hover:bg-muted/50 border border-border/30 rounded-2xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
              Built for every learner.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a student, professional, or curious mind, we've got you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div 
                key={index} 
                className="group p-8 bg-background border border-border/30 rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl mb-6">{useCase.image}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Logo Cloud */}
      <section className="py-20 px-6 border-y border-border/30">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-10">
            Trusted by learners from the world's leading institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40">
            {["Stanford", "MIT", "Harvard", "Oxford", "Cambridge", "Berkeley"].map((name) => (
              <div key={name} className="text-xl md:text-2xl font-semibold text-foreground">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6">
            Ready to transform
            <br />
            how you learn?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join millions of learners already using AI to master new skills faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Link to="/signup">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-10 py-6 text-base font-medium">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-sm">K</span>
                </div>
                <span className="font-semibold text-foreground">KnowIt AI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Empowering learners worldwide with AI-powered education that adapts to you.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/gamemodes" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
                <li><Link to="/store" className="hover:text-foreground transition-colors">Premium</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4 text-sm">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 KnowIt AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Shield className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
