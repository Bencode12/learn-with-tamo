import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, Brain, TrendingUp, Zap, Trophy, Users, Target, Lightbulb,
  Star, ArrowRight, CheckCircle2, Sparkles, Play, Quote
} from "lucide-react";
import { AnimatedHero } from "@/components/AnimatedHero";
import { ScrollRevealSection } from "@/components/ScrollRevealSection";
import { FeatureCard } from "@/components/FeatureCard";
import { TiltCard } from "@/components/TiltCard";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized lessons that adapt to your learning style and pace in real-time",
      gradient: "bg-gradient-to-br from-violet-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Smart Assessments",
      description: "Comprehensive tests that identify strengths and areas for improvement",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Detailed insights and analytics to track your learning journey",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-600"
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Earn XP, unlock achievements, and compete on global leaderboards",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Multiplayer Learning",
      description: "Team up with friends for collaborative study sessions and challenges",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-600"
    },
    {
      icon: Lightbulb,
      title: "Interactive Lessons",
      description: "Engaging content with quizzes, examples, and hands-on practice",
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-600"
    },
  ];

  const subjects = [
    { name: "Mathematics", icon: "📐", courses: 50 },
    { name: "Sciences", icon: "🔬", courses: 40 },
    { name: "Programming", icon: "💻", courses: 30 },
    { name: "Languages", icon: "🌍", courses: 20 },
    { name: "History", icon: "📜", courses: 25 },
    { name: "Arts", icon: "🎨", courses: 15 },
  ];

  const testimonials = [
    {
      name: "Alex K.",
      role: "Computer Science Student",
      content: "SūdžiusAI helped me master calculus in just 2 months. The AI-generated lessons are incredibly tailored to my learning style.",
      rating: 5,
      avatar: "AK"
    },
    {
      name: "Maria S.",
      role: "High School Senior",
      content: "The gamification keeps me motivated. I've maintained a 60-day streak and improved my grades significantly.",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "James L.",
      role: "Self-learner",
      content: "Best learning platform I've used. The personalized assessments really understand where I need help.",
      rating: 5,
      avatar: "JL"
    }
  ];

  const steps = [
    { 
      step: 1, 
      title: "Take Assessment", 
      desc: "Our AI evaluates your current knowledge and learning preferences",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      step: 2, 
      title: "Get Your Plan", 
      desc: "Receive a personalized learning path designed for your goals",
      gradient: "from-violet-500 to-purple-500"
    },
    { 
      step: 3, 
      title: "Learn & Master", 
      desc: "Progress through AI-generated lessons at your own pace",
      gradient: "from-emerald-500 to-teal-500"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AnimatedHero />

      <main className="relative">
        {/* Background gradient for sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />

        {/* Features Grid */}
        <section className="relative py-24 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <ScrollRevealSection className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-6">
                <Zap className="h-4 w-4 text-violet-400" />
                <span className="text-violet-300 font-medium">Why Choose Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Learn smarter, <span className="text-gradient-animate">not harder</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Our AI-powered platform adapts to your unique learning style for maximum efficiency
              </p>
            </ScrollRevealSection>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <ScrollRevealSection key={index} delay={index * 100}>
                  <FeatureCard {...feature} />
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="relative py-24 px-6 lg:px-20 bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <ScrollRevealSection className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-6">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Subjects</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Master <span className="text-emerald-400">any subject</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                From mathematics to music, our AI creates personalized learning paths for every discipline
              </p>
            </ScrollRevealSection>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {subjects.map((subject, index) => (
                <ScrollRevealSection key={index} delay={index * 80}>
                  <TiltCard tiltAmount={15}>
                    <Card className="group bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer overflow-hidden">
                      <CardContent className="pt-6 text-center relative">
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="text-5xl mb-3 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300">
                          {subject.icon}
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{subject.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{subject.courses}+ courses</p>
                      </CardContent>
                    </Card>
                  </TiltCard>
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="relative py-24 px-6 lg:px-20">
          <div className="max-w-5xl mx-auto">
            <ScrollRevealSection className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-6">
                <Play className="h-4 w-4 text-blue-400" />
                <span className="text-blue-300 font-medium">How It Works</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Start learning in <span className="text-blue-400">3 steps</span>
              </h2>
            </ScrollRevealSection>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((item, index) => (
                <ScrollRevealSection key={item.step} delay={index * 150}>
                  <div className="text-center relative group">
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent" />
                    )}
                    
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg relative group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <span className="text-3xl font-bold text-white">{item.step}</span>
                      {/* Glow effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{item.desc}</p>
                  </div>
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-24 px-6 lg:px-20 bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <ScrollRevealSection className="text-center mb-16">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-6">
                <Star className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300 font-medium">Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Loved by <span className="text-amber-400">learners</span>
              </h2>
            </ScrollRevealSection>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <ScrollRevealSection key={idx} delay={idx * 150}>
                  <TiltCard tiltAmount={6}>
                    <Card className="bg-slate-900/80 border-slate-800 h-full hover:border-amber-500/30 transition-all duration-500 group">
                      <CardContent className="pt-6">
                        <Quote className="h-8 w-8 text-slate-700 mb-4 group-hover:text-amber-500/50 transition-colors" />
                        <div className="flex gap-1 mb-4">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 50}ms` }} />
                          ))}
                        </div>
                        <p className="text-slate-300 mb-6 leading-relaxed group-hover:text-white transition-colors">"{t.content}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold group-hover:scale-110 transition-transform">
                            {t.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{t.name}</p>
                            <p className="text-sm text-slate-500">{t.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TiltCard>
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-6 lg:px-20 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          
          <ScrollRevealSection>
            <div className="max-w-4xl mx-auto text-center relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to transform your learning?
              </h2>
              <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                Join millions of learners already using AI to master new skills faster than ever before.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 bg-white text-emerald-600 hover:bg-slate-100 font-semibold shadow-2xl btn-revolut hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-emerald-100">
                {['No credit card', 'Free forever plan', 'Cancel anytime'].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollRevealSection>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">SūdžiusAI</span>
              </Link>
              <p className="text-slate-400 max-w-md leading-relaxed">
                Empowering learners worldwide with AI-powered education. 
                Personalized, gamified, and effective learning for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Learning</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/gamemodes" className="hover:text-white transition-colors">Game Modes</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
            <p>© 2024 SūdžiusAI. Revolutionizing education with artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
