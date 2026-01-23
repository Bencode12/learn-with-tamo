import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Code, School, User, Briefcase, Presentation, Heart, Play, Plus, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";

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
      navigate("/program-learning");
    } else {
      setShowPlanSelector(true);
    }
  };

  const handleContinuePlan = (planId?: string) => {
    setShowPlanSelector(false);
    navigate("/program-learning");
  };
  
  const learningPathways = [
    {
      id: "program",
      name: "Personalized Learning",
      description: "AI-generated curriculum tailored to your goals and learning style",
      icon: Code,
      isPrimary: true,
      hasPlans: existingPlans.length > 0
    },
    {
      id: "school",
      name: "School Curriculum",
      description: "Follow your school's syllabus with AI-enhanced explanations",
      icon: School,
      route: "/school-learning"
    },
    {
      id: "self",
      name: "Self-Paced",
      description: "Explore topics freely at your own pace",
      icon: User,
      route: "/self-learning"
    },
    {
      id: "other",
      name: "Special Modules",
      description: "Job prep, presentations, hobbies and more",
      icon: Briefcase,
      route: "/other-modules",
      isGroup: true
    }
  ];

  const specialModules = [
    {
      id: "job-interview",
      name: "Job Interview Prep",
      description: "Practice common interview questions",
      icon: Briefcase,
      route: "/job-interview-prep"
    },
    {
      id: "presentation",
      name: "Presentation Skills",
      description: "Master public speaking",
      icon: Presentation,
      route: "/presentation-prep"
    },
    {
      id: "hobby",
      name: "Hobby Learning",
      description: "Explore personal interests",
      icon: Heart,
      route: "/hobby-learning"
    }
  ];

  return (
    <AppLayout title="Learning" subtitle="Choose your learning pathway">
      <div className="grid md:grid-cols-2 gap-6">
        {learningPathways.map((pathway) => (
          <Card 
            key={pathway.id} 
            className={`relative border-border/40 hover:border-foreground/20 transition-all duration-300 ${
              pathway.isPrimary ? 'ring-1 ring-foreground/10' : ''
            }`}
          >
            {pathway.isPrimary && (
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="bg-foreground/5 border-foreground/10 text-foreground">
                  Recommended
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center">
                  <pathway.icon className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <CardTitle className="text-lg mb-1">{pathway.name}</CardTitle>
                  <CardDescription className="text-sm">{pathway.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {pathway.isGroup ? (
                <div className="space-y-2">
                  {specialModules.map((module) => (
                    <Button 
                      key={module.id}
                      variant="outline" 
                      className="w-full justify-between h-auto py-3 px-4 border-border/40 hover:bg-muted/50"
                      onClick={() => navigate(module.route)}
                    >
                      <div className="flex items-center gap-3">
                        <module.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{module.name}</div>
                          <div className="text-xs text-muted-foreground">{module.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              ) : pathway.id === "program" ? (
                <div className="space-y-3">
                  {existingPlans.length > 0 ? (
                    <>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-foreground" />
                          <span className="font-medium text-sm">
                            {existingPlans.length} Active Plan{existingPlans.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{existingPlans[0].name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="border-border/40"
                          onClick={() => navigate("/program-learning")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Plan
                        </Button>
                        <Button 
                          className="bg-foreground text-background hover:bg-foreground/90"
                          onClick={handleProgramLearningClick}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button 
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                      onClick={() => navigate("/program-learning")}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full border-border/40"
                  onClick={() => navigate(pathway.route || "#")}
                >
                  Select
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Selector Dialog */}
      <Dialog open={showPlanSelector} onOpenChange={setShowPlanSelector}>
        <DialogContent className="border-border/40">
          <DialogHeader>
            <DialogTitle>Your Learning Plans</DialogTitle>
            <DialogDescription>
              Choose a plan to continue or create a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {existingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className="cursor-pointer hover:bg-muted/50 border-border/40 transition-colors"
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
                    <Badge variant="outline" className="border-border/40">{plan.fields.length} fields</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button 
              variant="outline" 
              className="w-full border-border/40"
              onClick={() => {
                setShowPlanSelector(false);
                navigate("/program-learning");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default GameModes;
