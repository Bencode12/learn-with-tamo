import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowLeft, Calculator, Atom, History, Code, Languages, Music, Palette, CheckCircle, Calendar, Target, Clock, Play, Sparkles, Brain, AlertCircle, Lock, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateAssessment, subjectFieldsMap, FREE_MATH_FIELDS } from "@/data/programAssessments";
import { Input } from "@/components/ui/input";

const subjects = [
  { id: "math", name: "Mathematics", icon: Calculator },
  { id: "science", name: "Science", icon: Atom },
  { id: "history", name: "History", icon: History },
  { id: "languages", name: "Languages", icon: Languages },
  { id: "coding", name: "Programming", icon: Code },
  { id: "music", name: "Music", icon: Music },
  { id: "art", name: "Art & Design", icon: Palette },
];

const timeframes = [
  { id: "1month", label: "1 Month", months: 1, hoursPerDay: "3-4" },
  { id: "2months", label: "2 Months", months: 2, hoursPerDay: "2-3" },
  { id: "3months", label: "3 Months", months: 3, hoursPerDay: "1-2" },
  { id: "6months", label: "6 Months", months: 6, hoursPerDay: "1" },
];

// Generate assessment from the centralized bank


const ProgramLearning = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Subject, 2: Fields, 3: Time, 4: Assessment, 5: Plan
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("");
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingPlans, setExistingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [fieldSearch, setFieldSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadExistingPlans();
  }, [user]);

  const loadExistingPlans = async () => {
    if (!user) return;
    
    const [plansRes, profileRes] = await Promise.all([
      supabase.from('learning_plans').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('profiles').select('is_premium, subscription_tier').eq('id', user.id).single()
    ]);
    
    if (plansRes.data) setExistingPlans(plansRes.data);
    if (profileRes.data) {
      setIsPremium(profileRes.data.is_premium || (profileRes.data.subscription_tier !== null && profileRes.data.subscription_tier !== 'free'));
    }
    setLoading(false);
  };

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const startAssessment = () => {
    const questions = generateAssessment(selectedSubject, selectedFields);
    setAssessmentQuestions(questions);
    setCurrentQuestion(0);
    setAssessmentAnswers({});
    setStep(4);
  };

  const handleAssessmentAnswer = (answer: string) => {
    const currentQ = assessmentQuestions[currentQuestion];
    setAssessmentAnswers(prev => ({
      ...prev,
      [currentQ.id]: answer
    }));
    
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let fieldScores: Record<string, { correct: number; total: number }> = {};
    
    assessmentQuestions.forEach(q => {
      if (!fieldScores[q.field]) {
        fieldScores[q.field] = { correct: 0, total: 0 };
      }
      fieldScores[q.field].total++;
      
      if (assessmentAnswers[q.id] === q.correct) {
        correct++;
        fieldScores[q.field].correct++;
      }
    });
    
    return {
      overall: Math.round((correct / assessmentQuestions.length) * 100),
      byField: fieldScores
    };
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    const score = calculateScore();
    const timeframe = timeframes.find(t => t.id === selectedTimeframe);
    const weeks = (timeframe?.months || 1) * 4;
    
    // Generate weekly plan based on assessment results
    const weeklyPlan = [];
    const currentFields = subjectFieldsMap[selectedSubject] || [];
    const fieldsToStudy = selectedFields.map(f => ({
      id: f,
      name: currentFields.find(mf => mf.id === f)?.name || f,
      score: score.byField[f] ? Math.round((score.byField[f].correct / score.byField[f].total) * 100) : 0
    }));
    
    // Sort by score (lowest first - needs more work)
    fieldsToStudy.sort((a, b) => a.score - b.score);
    
    for (let week = 1; week <= weeks; week++) {
      const focusField = fieldsToStudy[(week - 1) % fieldsToStudy.length];
      weeklyPlan.push({
        week,
        focus: focusField.name,
        goals: [
          `Master core concepts in ${focusField.name}`,
          `Complete ${Math.ceil(10 / weeks * week)} practice problems`,
          `Review and self-test on covered material`
        ],
        activities: [
          { name: "Theory lessons", duration: "60 min" },
          { name: "Practice problems", duration: "90 min" },
          { name: "Review session", duration: "30 min" }
        ],
        hoursPerDay: timeframe?.hoursPerDay || "2"
      });
    }
    
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || selectedSubject;
    const planName = `${subjectName} Mastery - ${selectedFields.length} Fields`;
    
    // Save to database
    const { data, error } = await supabase
      .from('learning_plans')
      .insert({
        user_id: user?.id,
        name: planName,
        subject: selectedSubject,
        fields: selectedFields,
        duration_months: timeframe?.months || 1,
        assessment_score: score.overall,
        assessment_answers: assessmentAnswers,
        weekly_plan: weeklyPlan,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      toast.error("Failed to save plan");
      console.error(error);
    } else {
      setGeneratedPlan({
        ...data,
        score,
        weeklyPlan,
        fieldsToStudy
      });
      toast.success("Learning plan created!");
    }
    
    setIsGenerating(false);
    setStep(5);
  };

  const answeredAll = Object.keys(assessmentAnswers).length === assessmentQuestions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If user has existing plans and hasn't started creating new one, show plan selector
  if (existingPlans.length > 0 && step === 1 && !showCreateNew) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link to="/gamemodes">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                    <span className="text-background font-bold text-base">K</span>
                  </div>
                  <h1 className="text-lg font-bold hidden sm:block">KnowIt AI</h1>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Brain className="h-4 w-4" />
              Program Learning
            </div>
            <h2 className="text-3xl font-bold mb-2">Your Learning Plans</h2>
            <p className="text-muted-foreground">Continue an existing plan or create a new one</p>
          </div>

          <div className="space-y-4 mb-6">
            {existingPlans.map(plan => (
              <Card key={plan.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/program-study?planId=${plan.id}`)}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.subject} · Week {plan.current_week} of {(plan.weekly_plan as any[])?.length || 0} · Score: {plan.assessment_score}%
                    </p>
                  </div>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-1" /> Continue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={() => setShowCreateNew(true)}>
            <Sparkles className="h-4 w-4 mr-2" /> Create New Plan
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/gamemodes">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-base">K</span>
                </div>
                <h1 className="text-lg font-bold hidden sm:block">KnowIt AI</h1>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            Program Learning
          </div>
          <h2 className="text-3xl font-bold mb-2">Create Your Learning Plan</h2>
          <p className="text-muted-foreground">Personalized pathway based on your assessment</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{step} of 5</span>
            </div>
            <Progress value={(step / 5) * 100} className="h-2 mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={step >= 1 ? "text-primary font-medium" : ""}>Subject</span>
              <span className={step >= 2 ? "text-primary font-medium" : ""}>Fields</span>
              <span className={step >= 3 ? "text-primary font-medium" : ""}>Duration</span>
              <span className={step >= 4 ? "text-primary font-medium" : ""}>Assessment</span>
              <span className={step >= 5 ? "text-primary font-medium" : ""}>Plan</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Subject Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Select Subject
              </CardTitle>
              <CardDescription>Choose the subject you want to master</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                      selectedSubject === subject.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <subject.icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">{subject.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedSubject}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Fields Selection */}
        {step === 2 && (() => {
          const allFields = subjectFieldsMap[selectedSubject] || [];
          const isMath = selectedSubject === "math";
          const categories = [...new Set(allFields.map(f => f.category).filter(Boolean))];
          
          const filteredFields = allFields.filter(f => {
            const matchesSearch = !fieldSearch || f.name.toLowerCase().includes(fieldSearch.toLowerCase());
            const matchesCategory = !selectedCategory || f.category === selectedCategory;
            return matchesSearch && matchesCategory;
          });

          const isFieldLocked = (fieldId: string) => {
            return isMath && !isPremium && !FREE_MATH_FIELDS.includes(fieldId);
          };

          return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Select Fields to Study
              </CardTitle>
              <CardDescription>
                Choose the areas you want to focus on
                {isMath && !isPremium && (
                  <span className="block mt-1 text-xs">
                    <Lock className="h-3 w-3 inline mr-1" />
                    Free plan includes Algebra, Geometry, Calculus, Trigonometry & Probability. <Link to="/store" className="text-primary underline">Upgrade</Link> for all fields.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search & category filters for math */}
              {isMath && (
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search fields..."
                      value={fieldSearch}
                      onChange={(e) => setFieldSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={selectedCategory === null ? "default" : "outline"} onClick={() => setSelectedCategory(null)}>All</Button>
                    {categories.map(cat => (
                      <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(cat!)}>
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 max-h-[400px] overflow-y-auto pr-1">
                {filteredFields.map((field) => {
                  const locked = isFieldLocked(field.id);
                  return (
                    <button
                      key={field.id}
                      onClick={() => {
                        if (locked) {
                          toast.error("Upgrade to Premium to access this field");
                          return;
                        }
                        handleFieldToggle(field.id);
                      }}
                      className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                        locked
                          ? "border-border opacity-50 cursor-not-allowed"
                          : selectedFields.includes(field.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl">{field.icon}</span>
                      <span className="text-sm font-medium text-left">{field.name}</span>
                      {locked ? (
                        <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
                      ) : selectedFields.includes(field.id) ? (
                        <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {filteredFields.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p>No fields found</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => { setStep(1); setFieldSearch(""); setSelectedCategory(null); }}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={selectedFields.length === 0}>
                  Continue ({selectedFields.length} selected)
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })()}

        {/* Step 3: Timeframe Selection */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Select Duration
              </CardTitle>
              <CardDescription>How long do you want your learning program to be?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="space-y-3 mb-6">
                {timeframes.map((time) => (
                  <label
                    key={time.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTimeframe === time.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={time.id} id={time.id} />
                      <div>
                        <span className="font-medium">{time.label}</span>
                        <p className="text-sm text-muted-foreground">{time.hoursPerDay} hours/day recommended</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{time.months * 4} weeks</Badge>
                  </label>
                ))}
              </RadioGroup>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={startAssessment} disabled={!selectedTimeframe}>
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Assessment */}
        {step === 4 && assessmentQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Assessment
                </CardTitle>
                <Badge variant="outline">
                  {currentQuestion + 1} / {assessmentQuestions.length}
                </Badge>
              </div>
              <Progress value={((currentQuestion + 1) / assessmentQuestions.length) * 100} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Badge className="mb-3">
                  {(subjectFieldsMap[selectedSubject] || []).find(f => f.id === assessmentQuestions[currentQuestion].field)?.name}
                </Badge>
                <h3 className="text-xl font-semibold mb-4">
                  {assessmentQuestions[currentQuestion].question}
                </h3>
                
                <RadioGroup
                  value={assessmentAnswers[assessmentQuestions[currentQuestion].id] || ""}
                  onValueChange={handleAssessmentAnswer}
                  className="space-y-3"
                >
                  {assessmentQuestions[currentQuestion].options.map((option: string, idx: number) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        assessmentAnswers[assessmentQuestions[currentQuestion].id] === option
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={option} />
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                {currentQuestion < assessmentQuestions.length - 1 ? (
                  <Button 
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    disabled={!assessmentAnswers[assessmentQuestions[currentQuestion].id]}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={generatePlan}
                    disabled={!answeredAll || isGenerating}
                  >
                    {isGenerating ? "Generating Plan..." : "Generate Plan"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Generated Plan */}
        {step === 5 && generatedPlan && (
          <div className="space-y-6">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Your Learning Plan is Ready!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{generatedPlan.score.overall}%</div>
                    <div className="text-xs text-muted-foreground">Assessment Score</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{selectedFields.length}</div>
                    <div className="text-xs text-muted-foreground">Fields</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{generatedPlan.weeklyPlan.length}</div>
                    <div className="text-xs text-muted-foreground">Weeks</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{generatedPlan.weeklyPlan[0]?.hoursPerDay}</div>
                    <div className="text-xs text-muted-foreground">Hours/Day</div>
                  </div>
                </div>

                {/* Field Breakdown */}
                <h4 className="font-semibold mb-3">Your Proficiency by Field</h4>
                <div className="space-y-2 mb-6">
                  {generatedPlan.fieldsToStudy.map((field: any) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <span className="text-sm w-40 truncate">{field.name}</span>
                      <Progress value={field.score} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{field.score}%</span>
                    </div>
                  ))}
                </div>

                {/* Weekly Plan Preview */}
                <h4 className="font-semibold mb-3">Weekly Plan Preview</h4>
                <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
                  {generatedPlan.weeklyPlan.slice(0, 4).map((week: any) => (
                    <Card key={week.week}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge>Week {week.week}</Badge>
                          <span className="text-sm text-muted-foreground">{week.hoursPerDay}h/day</span>
                        </div>
                        <h5 className="font-medium">Focus: {week.focus}</h5>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          {week.goals.map((goal: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                  {generatedPlan.weeklyPlan.length > 4 && (
                    <p className="text-center text-muted-foreground text-sm">
                      +{generatedPlan.weeklyPlan.length - 4} more weeks...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/gamemodes")}>
                Back to Game Modes
              </Button>
              <Button className="flex-1" onClick={() => navigate(`/program-study?planId=${generatedPlan.id}`)}>
                <Play className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProgramLearning;