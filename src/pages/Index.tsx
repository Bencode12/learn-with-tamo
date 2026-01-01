import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, TrendingUp, Zap, Trophy, Languages, Camera, FileText, BarChart3, Video, Target, Lightbulb, Users, Presentation, ImageIcon, MessageSquare } from "lucide-react";
import { AnimatedHero } from "@/components/AnimatedHero";

const Index = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Tamo API Integration",
      description: "Seamlessly sync your grades and academic data from Tamo platform",
      color: "bg-blue-500"
    },
    {
      icon: Languages,
      title: "Multi-Language Support",
      description: "Learn in your preferred language with full localization support",
      color: "bg-green-500"
    },
    {
      icon: Presentation,
      title: "Interactive Slides & Links",
      description: "Create, edit and share educational content with rich media support",
      color: "bg-purple-500"
    },
    {
      icon: Camera,
      title: "Image & Photo OCR",
      description: "Extract text from images and photos for instant learning assistance",
      color: "bg-orange-500"
    },
    {
      icon: Brain,
      title: "AI-Powered Suggestions",
      description: "Get personalized recommendations based on your learning patterns",
      color: "bg-indigo-500"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Track your learning journey with detailed charts and insights",
      color: "bg-cyan-500"
    },
    {
      icon: Trophy,
      title: "Competitive Leaderboard",
      description: "Compete with peers and track your ranking among other learners",
      color: "bg-yellow-500"
    },
    {
      icon: Video,
      title: "Manim AI Videos",
      description: "Generate educational videos with AI assistance for complex problems",
      color: "bg-red-500"
    },
    {
      icon: Target,
      title: "Smart Recommendations",
      description: "Receive tailored suggestions to improve weak areas and excel",
      color: "bg-pink-500"
    },
    {
      icon: MessageSquare,
      title: "Eduka Answers",
      description: "Access comprehensive answers and explanations for various subjects",
      color: "bg-gray-400"
    }
  ];

  const subjects = [
    "Sciences", "Mathematics", "History", 
    "Literature", "Geography", "Computer Science", "Languages"
  ];

  return (
    <div className="min-h-screen">
      <AnimatedHero />

      <main>
        {/* Features Showcase */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Powerful Features in Development
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore our comprehensive roadmap of cutting-edge educational technologies
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className={`absolute top-0 left-0 w-full h-1 ${feature.color}`}></div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Master Any Subject
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Our AI adapts to help you excel across all academic disciplines
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {subjects.map((subject, index) => (
                <Badge key={index} variant="outline" className="px-4 py-2 text-sm font-medium">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              How SūdžiusAI Works
            </h2>
            <div className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Choose Your Path</h3>
                  <p className="text-muted-foreground">Select from multiple learning modes: solo practice, competitive multiplayer, or team collaboration. Our adaptive system adjusts to your learning style and pace.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Learn by Doing</h3>
                  <p className="text-muted-foreground">Engage with interactive lessons featuring video content, hands-on exercises, and real-time feedback. Our wellness check-in system helps track your mental health while our AI provides personalized tips when you need help.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Track & Excel</h3>
                  <p className="text-muted-foreground">Monitor your progress with detailed analytics, compete on leaderboards, and earn achievements. Premium users unlock AI-powered insights that identify weak areas and suggest personalized improvement strategies.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Learning Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the future of education with AI-powered tutoring, comprehensive analytics, and interactive content creation.
            </p>
            <div className="flex justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <BookOpen className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold">SūdžiusAI</span>
                </Link>
              </div>
              <p className="text-gray-400 max-w-md">
                Empowering students worldwide with intelligent learning solutions, 
                AI-powered tutoring, and comprehensive educational tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 SūdžiusAI. Revolutionizing education with artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;