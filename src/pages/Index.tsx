import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, TrendingUp, Zap, Trophy, Languages, Target, Lightbulb, Users, Sparkles, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { AnimatedHero } from "@/components/AnimatedHero";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized lessons that adapt to your learning style and pace",
      color: "bg-gradient-to-br from-purple-500 to-indigo-600"
    },
    {
      icon: Target,
      title: "Smart Assessments",
      description: "Comprehensive tests that identify your strengths and weak areas",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Detailed analytics and insights to monitor your improvement",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600"
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Earn XP, unlock achievements, and compete on leaderboards",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Team up with friends for multiplayer study sessions",
      color: "bg-gradient-to-br from-pink-500 to-rose-600"
    },
    {
      icon: Lightbulb,
      title: "Interactive Lessons",
      description: "Engaging content with quizzes, examples, and practice problems",
      color: "bg-gradient-to-br from-amber-500 to-yellow-600"
    },
  ];

  const subjects = [
    { name: "Mathematics", icon: "📐", count: "50+ courses" },
    { name: "Sciences", icon: "🔬", count: "40+ courses" },
    { name: "Programming", icon: "💻", count: "30+ courses" },
    { name: "Languages", icon: "🌍", count: "20+ languages" },
    { name: "History", icon: "📜", count: "25+ courses" },
    { name: "Arts", icon: "🎨", count: "15+ courses" },
  ];

  const testimonials = [
    {
      name: "Alex K.",
      role: "Computer Science Student",
      content: "SūdžiusAI helped me master calculus in just 2 months. The AI-generated lessons are incredibly helpful!",
      rating: 5
    },
    {
      name: "Maria S.",
      role: "High School Senior",
      content: "The gamification keeps me motivated. I've maintained a 60-day streak and improved my grades significantly.",
      rating: 5
    },
    {
      name: "James L.",
      role: "Self-learner",
      content: "Best learning platform I've used. The personalized assessments really understand where I need help.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AnimatedHero />

      <main>
        {/* Features Grid */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Why Choose Us
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                Learn Smarter, Not Harder
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform adapts to your unique learning style for maximum efficiency
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <CardHeader>
                    <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                Subjects
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                Master Any Subject
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From mathematics to music, our AI creates personalized learning paths for every discipline
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {subjects.map((subject, index) => (
                <Card 
                  key={index}
                  className="group text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/30"
                >
                  <CardContent className="pt-6">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {subject.icon}
                    </div>
                    <h3 className="font-bold text-foreground">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{subject.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Zap className="h-3.5 w-3.5 mr-1" />
                How It Works
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                Start Learning in 3 Steps
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: "Take Assessment", desc: "Our AI evaluates your current knowledge across all topics", color: "from-blue-500 to-cyan-500" },
                { step: 2, title: "Get Your Plan", desc: "Receive a personalized learning path based on your goals", color: "from-purple-500 to-pink-500" },
                { step: 3, title: "Learn & Master", desc: "Progress through AI-generated lessons at your own pace", color: "from-emerald-500 to-teal-500" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-3xl font-black text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                <Star className="h-3.5 w-3.5 mr-1" />
                Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                Loved by Learners
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <Card key={idx} className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{t.content}"</p>
                    <div>
                      <p className="font-bold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-30" />
          <div className="max-w-4xl mx-auto text-center relative">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join thousands of learners already using AI to master new skills faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-10 py-7 bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-2xl">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-black">SūdžiusAI</span>
              </Link>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Empowering learners worldwide with AI-powered education. 
                Personalized, gamified, and effective learning for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Learning</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/gamemodes" className="hover:text-white transition-colors">Game Modes</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2024 SūdžiusAI. Revolutionizing education with artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;