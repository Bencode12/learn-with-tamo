import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, ArrowLeft, Code, School, User, Briefcase, Presentation, Heart, Sparkles, Play, Settings, Plus, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LanguageSelector from "@/components/LanguageSelector";

interface LearningPlan {
  id: string;
  name: string;
  subject: string;
  fields: string[];
  duration_months: number;
  current_week: number;
  status: string;
  created_at: string;
}

const GameModes = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [existingPlans, setExistingPlans] = useState<LearningPlan[]>([]);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadExistingPlans();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadExistingPlans = async () => {
    const { data, error } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (data) {
      setExistingPlans(data as LearningPlan[]);
    }
    setLoading(false);
  };

  const handleProgramLearningClick = () => {
    if (existingPlans.length === 0) {
      // No plans, go to create new
      navigate("/program-learning");
    } else if (existingPlans.length === 1) {
      // Single plan, show options
      setShowPlanSelector(true);
    } else {
      // Multiple plans, show selector
      setShowPlanSelector(true);
    }
  };

  const handleContinuePlan = (planId?: string) => {
    // For now, just navigate - in future this would start the lesson
    setShowPlanSelector(false);
    navigate("/program-learning");
  };
  
  const learningPathways = [
    {
      id: "program",
      name: t('programLearning'),
      description: t('programLearningDesc'),
      icon: Code,
      color: "bg-primary",
      isPrimary: true,
      hasPlans: existingPlans.length > 0
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
                ) : pathway.id === "program" ? (
                  // Program Learning with plan management
                  <div className="space-y-3">
                    {existingPlans.length > 0 ? (
                      <>
                        <div className="p-3 bg-primary/10 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">
                              {existingPlans.length} Active Plan{existingPlans.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {existingPlans[0].name}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-col h-auto py-3"
                            onClick={() => navigate("/program-learning")}
                          >
                            <Settings className="h-4 w-4 mb-1" />
                            <span className="text-xs">Modify</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-col h-auto py-3"
                            onClick={() => navigate("/program-learning")}
                          >
                            <Plus className="h-4 w-4 mb-1" />
                            <span className="text-xs">New Plan</span>
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-col h-auto py-3 bg-primary"
                            onClick={handleProgramLearningClick}
                          >
                            <Play className="h-4 w-4 mb-1" />
                            <span className="text-xs">Continue</span>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => navigate("/program-learning")}
                      >
                        {t('startPersonalizedPlan')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Link to={pathway.route || "#"} className="block">
                    <Button 
                      className="w-full"
                      variant="secondary"
                    >
                      {t('selectPathway')}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Plan Selector Dialog */}
      <Dialog open={showPlanSelector} onOpenChange={setShowPlanSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Learning Plans</DialogTitle>
            <DialogDescription>
              Choose a plan to continue or manage your plans
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {existingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleContinuePlan(plan.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Week {plan.current_week} of {plan.duration_months * 4}
                      </p>
                    </div>
                    <Badge>{plan.fields.length} fields</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowPlanSelector(false);
                  navigate("/program-learning");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameModes;