import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Code, School, User, Briefcase, Presentation, Heart, Play, Plus, CheckCircle, ArrowRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "@/hooks/use-toast";

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
    const { data } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (data) setExistingPlans(data as LearningPlan[]);
    setLoading(false);
  };

  const handleDeletePlan = async (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('learning_plans')
      .delete()
      .eq('id', planId);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" });
    } else {
      toast({ title: "Plan deleted" });
      setExistingPlans(prev => prev.filter(p => p.id !== planId));
    }
  };

  const handleContinuePlan = (planId: string) => {
    setShowPlanSelector(false);
    navigate(`/program-study?planId=${planId}`);
  };

  const specialModules = [
    {
      id: "job-interview",
      name: "Job Interview Prep",
      description: "Practice common interview questions and get AI feedback on your answers",
      icon: Briefcase,
      route: "/job-interview-prep",
      gradient: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      id: "presentation",
      name: "Presentation Skills",
      description: "Master public speaking with real-time AI analysis of your delivery",
      icon: Presentation,
      route: "/presentation-prep",
      gradient: "from-blue-500/10 to-indigo-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "hobby",
      name: "Hobby Learning",
      description: "Explore personal interests with guided, bite-sized lessons",
      icon: Heart,
      route: "/hobby-learning",
      gradient: "from-rose-500/10 to-pink-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <AppLayout title="Learning" subtitle="Choose your learning pathway">
      {/* Main Learning Pathways */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Personalized Learning */}
        <Card className="relative border-border/40 hover:border-foreground/20 transition-all duration-300 ring-1 ring-foreground/10">
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-foreground/5 border-foreground/10 text-foreground">
              Recommended
            </Badge>
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center">
                <Code className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0 pr-16">
                <CardTitle className="text-lg mb-1">Personalized Learning</CardTitle>
                <CardDescription className="text-sm">AI-generated curriculum tailored to your goals and learning style</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                      onClick={() => {
                        if (existingPlans.length === 1) {
                          navigate(`/program-study?planId=${existingPlans[0].id}`);
                        } else {
                          setShowPlanSelector(true);
                        }
                      }}
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
          </CardContent>
        </Card>

        {/* School Curriculum */}
        <Card className="relative border-border/40 hover:border-foreground/20 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center">
                <School className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg mb-1">School Curriculum</CardTitle>
                <CardDescription className="text-sm">Follow your school's syllabus with AI-enhanced explanations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-border/40" onClick={() => navigate("/curriculum")}>
              Select <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Self-Paced */}
        <Card className="relative border-border/40 hover:border-foreground/20 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg mb-1">Self-Paced</CardTitle>
                <CardDescription className="text-sm">Explore topics freely at your own pace</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-border/40" onClick={() => navigate("/self-learning")}>
              Select <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Special Modules - Full-width banners */}
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-bold tracking-tight mb-4">Special Modules</h2>
        <div className="space-y-3">
          {specialModules.map((module) => (
            <button
              key={module.id}
              onClick={() => navigate(module.route)}
              className={`w-full group relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-r ${module.gradient} p-5 text-left transition-all duration-300 hover:border-foreground/20 hover:shadow-lg`}
            >
              <div className="flex items-center gap-5">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center ${module.iconColor}`}>
                  <module.icon className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-0.5">{module.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{module.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
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
                className="cursor-pointer hover:bg-muted/50 border-border/40 transition-colors group"
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-border/40">{plan.fields.length} fields</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={(e) => handleDeletePlan(plan.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
