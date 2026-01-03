import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Code, School, User, Briefcase, Presentation, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const GameModes = () => {
  const { t } = useLanguage();
  
  const learningPathways = [
    {
      id: "program",
      name: "Program Learning",
      description: "Personalized learning pathway generated based on your goals, proficiency level, and preferences. Begins with topic selection and assessment.",
      icon: Code,
      color: "bg-blue-600",
      route: "/program-learning",
      isPrimary: true
    },
    {
      id: "school",
      name: "School Learning",
      description: "Align learning with school curriculum and subjects",
      icon: School,
      color: "bg-green-500",
      route: "/school-learning"
    },
    {
      id: "self",
      name: "Self-Learning",
      description: "Personalized learning paths based on your interests",
      icon: User,
      color: "bg-purple-500",
      route: "/self-learning"
    },
    {
      id: "other",
      name: "Other Modules",
      description: "Specialized learning for specific use cases",
      icon: Briefcase,
      color: "bg-orange-500",
      route: "/other-modules"
    }
  ];
  const otherModules = [
    {
      id: "job-interview",
      name: "Job Interview Preparation",
      description: "Prepare for job interviews with AI-powered simulations",
      icon: Briefcase,
      route: "/job-interview-prep"
    },
    {
      id: "presentation",
      name: "Presentation Preparation",
      description: "Improve your presentation skills with AI feedback",
      icon: Presentation,
      route: "/presentation-prep"
    },
    {
      id: "hobby",
      name: "Hobby-Based Learning",
      description: "Learn new skills and hobbies in a structured way",
      icon: Heart,
      route: "/hobby-learning"
    }
  ];
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backTo')} Dashboard
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Learning Pathways</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose a learning pathway that suits your goals and preferences
          </p>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPathways.map((pathway) => (
              <Card 
                key={pathway.id} 
                className={`${pathway.isPrimary ? 'border-2 border-blue-500 ring-2 ring-blue-500/20' : ''} hover:shadow-lg transition-all duration-300`}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 ${pathway.color} rounded-full flex items-center justify-center`}>
                      <pathway.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        {pathway.name}
                        {pathway.isPrimary && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            Recommended
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">{pathway.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {pathway.id === "other" ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Specialized modules for specific use cases:
                      </p>
                      <div className="space-y-3">
                        {otherModules.map((module) => (
                          <Link key={module.id} to={module.route}>
                            <Button variant="outline" className="w-full h-auto py-3 flex items-center space-x-2 justify-start">
                              <module.icon className="h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium text-xs">{module.name}</div>
                                <div className="text-xs text-muted-foreground">{module.description}</div>
                              </div>
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link to={pathway.route}>
                      <Button className={`${pathway.isPrimary ? 'bg-blue-600 hover:bg-blue-700' : ''} w-full`}>
                        {pathway.isPrimary ? 'Start Personalized Plan' : `Select ${pathway.name}`}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/*
            Program Learning Workflow:
            1. Topic Selection - Choose desired subjects
            2. Timeframe Selection - Specify available learning time
            3. Assessment - Evaluate current proficiency
            4. Custom Plan Generation - AI creates personalized learning path
          */}
        </div>      </main>
    </div>
  );
};

export default GameModes;