import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, TrendingUp, Trophy, Target, Users, Sparkles, 
  ArrowRight, CheckCircle2, BookOpen, Zap, Shield, Globe
} from "lucide-react";
import { AnimatedHero } from "@/components/AnimatedHero";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Our AI adapts to your unique learning style, creating personalized lessons that evolve with your progress.",
    },
    {
      icon: Target,
      title: "Smart Assessments",
      description: "Comprehensive evaluations that identify your strengths and areas for improvement with precision.",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Detailed insights and visualizations to track your learning journey and celebrate milestones.",
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Earn XP, unlock achievements, and compete with friends to stay motivated.",
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Join study groups, challenge friends, and learn together in real-time multiplayer modes.",
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate, actionable feedback on every answer to accelerate your learning.",
    },
  ];

  const subjects = [
    { name: "Mathematics", icon: "📐", courses: "50+ courses", color: "from-blue-500/20 to-blue-600/10" },
    { name: "Sciences", icon: "🔬", courses: "40+ courses", color: "from-emerald-500/20 to-emerald-600/10" },
    { name: "Programming", icon: "💻", courses: "30+ courses", color: "from-purple-500/20 to-purple-600/10" },
    { name: "Languages", icon: "🌍", courses: "20+ languages", color: "from-orange-500/20 to-orange-600/10" },
    { name: "History", icon: "📜", courses: "25+ courses", color: "from-amber-500/20 to-amber-600/10" },
    { name: "Arts", icon: "🎨", courses: "15+ courses", color: "from-pink-500/20 to-pink-600/10" },
  ];

  const testimonials = [
    {
      name: "Alex K.",
      role: "Computer Science Student",
      content: "SūdžiusAI helped me master calculus in just 2 months. The AI-generated lessons are incredibly helpful!",
      avatar: "A",
    },
    {
      name: "Maria S.",
      role: "High School Senior",
      content: "The gamification keeps me motivated. I've maintained a 60-day streak and improved my grades significantly.",
      avatar: "M",
    },
    {
      name: "James L.",
      role: "Self-learner",
      content: "Best learning platform I've used. The personalized assessments really understand where I need help.",
      avatar: "J",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AnimatedHero />

      <main>
        {/* Logo Cloud */}
        <section className="py-16 px-6 border-b border-border/50">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-8">Trusted by learners from top institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
              <div className="text-xl font-semibold text-foreground/70">Stanford</div>
              <div className="text-xl font-semibold text-foreground/70">MIT</div>
              <div className="text-xl font-semibold text-foreground/70">Harvard</div>
              <div className="text-xl font-semibold text-foreground/70">Oxford</div>
              <div className="text-xl font-semibold text-foreground/70">Cambridge</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-emerald-500 font-semibold text-sm tracking-wide uppercase mb-3">Features</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with proven learning methodologies
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group bg-card/50 border-border/50 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-emerald-500 font-semibold text-sm tracking-wide uppercase mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Start learning in minutes
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                { 
                  step: 1, 
                  title: "Take Assessment", 
                  desc: "Complete a quick assessment so our AI understands your current level and goals",
                  icon: Target
                },
                { 
                  step: 2, 
                  title: "Get Your Plan", 
                  desc: "Receive a personalized learning path tailored to your objectives and schedule",
                  icon: Brain
                },
                { 
                  step: 3, 
                  title: "Learn & Master", 
                  desc: "Progress through AI-generated lessons with real-time feedback and support",
                  icon: Trophy
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-emerald-500 mb-2">Step {item.step}</div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                  {item.step < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-emerald-500 font-semibold text-sm tracking-wide uppercase mb-3">Subjects</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Master any subject
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From mathematics to music, our AI creates personalized learning experiences
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {subjects.map((subject, index) => (
                <Card 
                  key={index}
                  className={`group cursor-pointer border-border/50 hover:border-foreground/20 transition-all duration-300 overflow-hidden`}
                >
                  <CardContent className={`p-6 text-center bg-gradient-to-br ${subject.color}`}>
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {subject.icon}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{subject.courses}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-emerald-500 font-semibold text-sm tracking-wide uppercase mb-3">Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Loved by learners worldwide
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <Card key={idx} className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">"{t.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <span className="text-emerald-500 font-semibold">{t.avatar}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-12 md:p-16 text-center">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '32px 32px'
                }} />
              </div>
              
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to transform your learning?
                </h2>
                <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join millions of learners already using AI to master new skills faster than ever.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-emerald-600 hover:bg-white/90 font-semibold px-8 py-6 rounded-xl text-base">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 text-emerald-100 text-sm">
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
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-foreground">SūdžiusAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering learners worldwide with AI-powered education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/gamemodes" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
                <li><Link to="/store" className="hover:text-foreground transition-colors">Premium</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 SūdžiusAI. All rights reserved.</p>
            <div className="flex items-center gap-6">
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
