
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, TrendingUp, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LearnAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Learning
              <span className="block text-blue-600">Tailored for You</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect your grades, get personalized AI tutoring, and accelerate your learning journey with intelligent recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning Now
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Our Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <TrendingUp className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle>Grade Sync</CardTitle>
                  <CardDescription>
                    Automatically sync your grades from Tamo and track your progress in real-time
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Brain className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle>AI Tutoring</CardTitle>
                  <CardDescription>
                    Get personalized tutoring powered by advanced AI that adapts to your learning style
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Zap className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle>Smart Recommendations</CardTitle>
                  <CardDescription>
                    Receive intelligent suggestions to improve your weak areas and excel in your studies
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Connect Your Account</h3>
                  <p className="text-gray-600">Sign up and securely connect your Tamo credentials to sync your grades</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">AI Analysis</h3>
                  <p className="text-gray-600">Our AI analyzes your performance and identifies areas for improvement</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Personalized Learning</h3>
                  <p className="text-gray-600">Get customized tutoring sessions and recommendations to boost your grades</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students who have improved their grades with AI-powered learning
            </p>
            <Link to="/signup">
              <Button size="lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-semibold">LearnAI</span>
          </div>
          <p className="text-gray-400">
            © 2024 LearnAI. Empowering students with intelligent learning solutions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
