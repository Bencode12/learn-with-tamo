import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Code, School, User, Briefcase, Presentation, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const GameModes = () => {
  const { t } = useLanguage();
  
  const learningPathways = [
    {
      id: "program",
      name: t('programLearning'),
      description: t('programLearningDesc'),
      icon: Code,
      color: "bg-primary",
      route: "/program-learning",
      isPrimary: true
    },
    {
      id: "school",
      name: t('schoolLearning'),
      description: t('schoolLearningDesc'),
      icon: School,
      color: "bg-emerald-500",
      route: "/school-learning"
    },
    {
      id: "self",
      name: t('selfLearning'),
      description: t('selfLearningDesc'),
      icon: User,
      color: "bg-violet-500",
      route: "/self-learning"
    },
    {
      id: "other",
      name: t('otherModules'),
      description: t('otherModulesDesc'),
      icon: Briefcase,
      color: "bg-amber-500",
      route: "/other-modules"
    }
  ];

  const otherModules = [
    {
      id: "job-interview",
      name: t('jobInterviewPrep'),
      description: t('jobInterviewPrepDesc'),
      icon: Briefcase,
      route: "/job-interview-prep"
    },
    {
      id: "presentation",
      name: t('presentationPrep'),
      description: t('presentationPrepDesc'),
      icon: Presentation,
      route: "/presentation-prep"
    },
    {
      id: "hobby",
      name: t('hobbyLearning'),
      description: t('hobbyLearningDesc'),
      icon: Heart,
      route: "/hobby-learning"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('backTo')} {t('dashboard')}</span>
                </Button>
              </Link>
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <BookOpen className="h-7 w-7 text-primary" />
                <h1 className="text-lg font-bold hidden sm:block">SūdžiusAI</h1>
              </Link>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {t('learningModules')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('learningPathways')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('learningPathwaysDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPathways.map((pathway) => (
            <Card 
              key={pathway.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                pathway.isPrimary 
                  ? 'border-2 border-primary ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}
            >
              {pathway.isPrimary && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  {t('recommended')}
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${pathway.color} rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
                    <pathway.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1">{pathway.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{pathway.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pathway.id === "other" ? (
                  <div className="space-y-3">
                    {otherModules.map((module) => (
                      <Link key={module.id} to={module.route}>
                        <Button 
                          variant="outline" 
                          className="w-full h-auto py-3 px-4 flex items-start gap-3 justify-start text-left hover:bg-muted/50"
                        >
                          <module.icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm">{module.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{module.description}</div>
                          </div>
                        </Button>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link to={pathway.route} className="block">
                    <Button 
                      className={`w-full ${pathway.isPrimary ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={pathway.isPrimary ? 'default' : 'secondary'}
                    >
                      {pathway.isPrimary ? t('startPersonalizedPlan') : t('selectPathway')}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GameModes;