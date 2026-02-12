import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowLeft, Calculator, Atom, History, Code, Languages, Music, Palette, CheckCircle, Calendar, Target, Clock, Play, Sparkles, Brain, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Math subfields with comprehensive assessment questions
const mathFields = [
  { id: "algebra", name: "Algebra", icon: "📐" },
  { id: "geometry", name: "Geometry", icon: "📏" },
  { id: "calculus", name: "Calculus", icon: "∫" },
  { id: "probability", name: "Probability & Statistics", icon: "🎲" },
  { id: "linear_algebra", name: "Linear Algebra", icon: "📊" },
  { id: "complex_analysis", name: "Complex Analysis", icon: "ℂ" },
  { id: "trigonometry", name: "Trigonometry", icon: "📐" },
  { id: "number_theory", name: "Number Theory", icon: "🔢" },
  { id: "discrete_math", name: "Discrete Mathematics", icon: "🧮" },
  { id: "differential_equations", name: "Differential Equations", icon: "∂" },
];

// Science subfields
const scienceFields = [
  { id: "physics_mechanics", name: "Classical Mechanics", icon: "⚙️" },
  { id: "physics_em", name: "Electromagnetism", icon: "⚡" },
  { id: "physics_quantum", name: "Quantum Mechanics", icon: "🔬" },
  { id: "physics_thermo", name: "Thermodynamics", icon: "🌡️" },
  { id: "chemistry_organic", name: "Organic Chemistry", icon: "🧪" },
  { id: "chemistry_inorganic", name: "Inorganic Chemistry", icon: "⚗️" },
  { id: "chemistry_physical", name: "Physical Chemistry", icon: "🔥" },
  { id: "biology_cell", name: "Cell Biology", icon: "🦠" },
  { id: "biology_genetics", name: "Genetics", icon: "🧬" },
  { id: "biology_ecology", name: "Ecology", icon: "🌿" },
];

// History subfields
const historyFields = [
  { id: "ancient_history", name: "Ancient History", icon: "🏛️" },
  { id: "medieval_history", name: "Medieval History", icon: "⚔️" },
  { id: "modern_history", name: "Modern History", icon: "🏭" },
  { id: "world_wars", name: "World Wars", icon: "🎖️" },
  { id: "american_history", name: "American History", icon: "🗽" },
  { id: "european_history", name: "European History", icon: "🏰" },
  { id: "asian_history", name: "Asian History", icon: "🏯" },
  { id: "art_history", name: "Art History", icon: "🎨" },
];

// Programming subfields
const codingFields = [
  { id: "python", name: "Python", icon: "🐍" },
  { id: "javascript", name: "JavaScript", icon: "📜" },
  { id: "typescript", name: "TypeScript", icon: "💎" },
  { id: "react", name: "React", icon: "⚛️" },
  { id: "algorithms", name: "Algorithms", icon: "🔄" },
  { id: "data_structures", name: "Data Structures", icon: "📦" },
  { id: "databases", name: "Databases", icon: "🗄️" },
  { id: "web_dev", name: "Web Development", icon: "🌐" },
  { id: "machine_learning", name: "Machine Learning", icon: "🤖" },
];

// Languages subfields
const languagesFields = [
  { id: "spanish", name: "Spanish", icon: "🇪🇸" },
  { id: "french", name: "French", icon: "🇫🇷" },
  { id: "german", name: "German", icon: "🇩🇪" },
  { id: "japanese", name: "Japanese", icon: "🇯🇵" },
  { id: "chinese", name: "Chinese (Mandarin)", icon: "🇨🇳" },
  { id: "korean", name: "Korean", icon: "🇰🇷" },
  { id: "italian", name: "Italian", icon: "🇮🇹" },
  { id: "portuguese", name: "Portuguese", icon: "🇵🇹" },
];

// Music subfields
const musicFields = [
  { id: "music_theory", name: "Music Theory", icon: "🎼" },
  { id: "piano", name: "Piano", icon: "🎹" },
  { id: "guitar", name: "Guitar", icon: "🎸" },
  { id: "composition", name: "Composition", icon: "✍️" },
  { id: "ear_training", name: "Ear Training", icon: "👂" },
  { id: "music_production", name: "Music Production", icon: "🎧" },
];

// Art subfields
const artFields = [
  { id: "drawing", name: "Drawing Fundamentals", icon: "✏️" },
  { id: "painting", name: "Painting", icon: "🎨" },
  { id: "digital_art", name: "Digital Art", icon: "💻" },
  { id: "graphic_design", name: "Graphic Design", icon: "🖼️" },
  { id: "ui_ux", name: "UI/UX Design", icon: "📱" },
  { id: "3d_modeling", name: "3D Modeling", icon: "🧊" },
];

const subjects = [
  { id: "math", name: "Mathematics", icon: Calculator, fields: mathFields },
  { id: "science", name: "Science", icon: Atom, fields: scienceFields },
  { id: "history", name: "History", icon: History, fields: historyFields },
  { id: "languages", name: "Languages", icon: Languages, fields: languagesFields },
  { id: "coding", name: "Programming", icon: Code, fields: codingFields },
  { id: "music", name: "Music", icon: Music, fields: musicFields },
  { id: "art", name: "Art & Design", icon: Palette, fields: artFields },
];

const timeframes = [
  { id: "1month", label: "1 Month", months: 1, hoursPerDay: "3-4" },
  { id: "2months", label: "2 Months", months: 2, hoursPerDay: "2-3" },
  { id: "3months", label: "3 Months", months: 3, hoursPerDay: "1-2" },
  { id: "6months", label: "6 Months", months: 6, hoursPerDay: "1" },
];

// Comprehensive math assessment questions covering all fields
const generateMathAssessment = (selectedFields: string[]) => {
  const allQuestions = [
    // Algebra
    { id: "alg1", field: "algebra", question: "Solve for x: 3x + 7 = 22", options: ["3", "5", "7", "15"], correct: "5", difficulty: "easy" },
    { id: "alg2", field: "algebra", question: "Simplify: (x² - 4) / (x - 2)", options: ["x + 2", "x - 2", "x² - 2", "2x"], correct: "x + 2", difficulty: "medium" },
    { id: "alg3", field: "algebra", question: "Find the roots of x² - 5x + 6 = 0", options: ["2 and 3", "1 and 6", "-2 and -3", "3 and -2"], correct: "2 and 3", difficulty: "easy" },
    { id: "alg4", field: "algebra", question: "What is the sum of a geometric series: 1 + 2 + 4 + 8 + ... + 128?", options: ["255", "256", "127", "254"], correct: "255", difficulty: "hard" },
    
    // Geometry
    { id: "geo1", field: "geometry", question: "What is the area of a circle with radius 5?", options: ["25π", "10π", "5π", "50π"], correct: "25π", difficulty: "easy" },
    { id: "geo2", field: "geometry", question: "In a right triangle with legs 3 and 4, what is the hypotenuse?", options: ["5", "7", "6", "√7"], correct: "5", difficulty: "easy" },
    { id: "geo3", field: "geometry", question: "What is the sum of interior angles of a hexagon?", options: ["720°", "540°", "360°", "900°"], correct: "720°", difficulty: "medium" },
    { id: "geo4", field: "geometry", question: "Find the volume of a sphere with radius 3", options: ["36π", "27π", "108π", "12π"], correct: "36π", difficulty: "medium" },
    
    // Calculus
    { id: "calc1", field: "calculus", question: "What is the derivative of x³?", options: ["3x²", "x²", "3x", "x³"], correct: "3x²", difficulty: "easy" },
    { id: "calc2", field: "calculus", question: "∫ 2x dx = ?", options: ["x²", "x² + C", "2x²", "2x² + C"], correct: "x² + C", difficulty: "easy" },
    { id: "calc3", field: "calculus", question: "What is the limit of (sin x)/x as x → 0?", options: ["1", "0", "∞", "undefined"], correct: "1", difficulty: "medium" },
    { id: "calc4", field: "calculus", question: "Find d/dx of e^(2x)", options: ["2e^(2x)", "e^(2x)", "e^x", "2e^x"], correct: "2e^(2x)", difficulty: "medium" },
    
    // Probability
    { id: "prob1", field: "probability", question: "What is the probability of getting heads twice in two coin flips?", options: ["1/4", "1/2", "1/3", "3/4"], correct: "1/4", difficulty: "easy" },
    { id: "prob2", field: "probability", question: "In a standard deck, what's P(drawing a face card)?", options: ["12/52", "4/52", "16/52", "3/52"], correct: "12/52", difficulty: "easy" },
    { id: "prob3", field: "probability", question: "What is the mean of: 2, 4, 6, 8, 10?", options: ["6", "5", "7", "8"], correct: "6", difficulty: "easy" },
    { id: "prob4", field: "probability", question: "If P(A) = 0.3 and P(B) = 0.4, and A,B are independent, what is P(A∩B)?", options: ["0.12", "0.7", "0.1", "0.4"], correct: "0.12", difficulty: "medium" },
    
    // Linear Algebra
    { id: "lin1", field: "linear_algebra", question: "What is the determinant of [[1,2],[3,4]]?", options: ["-2", "2", "10", "-10"], correct: "-2", difficulty: "easy" },
    { id: "lin2", field: "linear_algebra", question: "What is the dimension of R³?", options: ["3", "2", "1", "∞"], correct: "3", difficulty: "easy" },
    { id: "lin3", field: "linear_algebra", question: "What is the rank of a 3×3 identity matrix?", options: ["3", "1", "9", "0"], correct: "3", difficulty: "easy" },
    { id: "lin4", field: "linear_algebra", question: "Which is NOT a property of matrix multiplication?", options: ["Commutativity", "Associativity", "Distributivity", "Identity element"], correct: "Commutativity", difficulty: "medium" },
    
    // Complex Analysis
    { id: "complex1", field: "complex_analysis", question: "What is i²?", options: ["-1", "1", "i", "-i"], correct: "-1", difficulty: "easy" },
    { id: "complex2", field: "complex_analysis", question: "What is the modulus of 3 + 4i?", options: ["5", "7", "1", "12"], correct: "5", difficulty: "easy" },
    { id: "complex3", field: "complex_analysis", question: "What is the conjugate of 2 - 3i?", options: ["2 + 3i", "-2 + 3i", "-2 - 3i", "3 - 2i"], correct: "2 + 3i", difficulty: "easy" },
    { id: "complex4", field: "complex_analysis", question: "e^(iπ) equals?", options: ["-1", "1", "i", "0"], correct: "-1", difficulty: "medium" },
    
    // Trigonometry
    { id: "trig1", field: "trigonometry", question: "What is sin(90°)?", options: ["1", "0", "-1", "undefined"], correct: "1", difficulty: "easy" },
    { id: "trig2", field: "trigonometry", question: "What is cos(0°)?", options: ["1", "0", "-1", "undefined"], correct: "1", difficulty: "easy" },
    { id: "trig3", field: "trigonometry", question: "sin²(x) + cos²(x) = ?", options: ["1", "0", "2", "sin(2x)"], correct: "1", difficulty: "easy" },
    { id: "trig4", field: "trigonometry", question: "What is tan(45°)?", options: ["1", "0", "√2", "undefined"], correct: "1", difficulty: "easy" },
    
    // Number Theory
    { id: "num1", field: "number_theory", question: "What is the GCD of 12 and 18?", options: ["6", "3", "12", "36"], correct: "6", difficulty: "easy" },
    { id: "num2", field: "number_theory", question: "Is 17 a prime number?", options: ["Yes", "No"], correct: "Yes", difficulty: "easy" },
    { id: "num3", field: "number_theory", question: "What is 15 mod 4?", options: ["3", "2", "1", "0"], correct: "3", difficulty: "easy" },
    { id: "num4", field: "number_theory", question: "The LCM of 4 and 6 is?", options: ["12", "24", "2", "6"], correct: "12", difficulty: "easy" },
    
    // Discrete Math
    { id: "disc1", field: "discrete_math", question: "How many subsets does a set with 3 elements have?", options: ["8", "6", "3", "9"], correct: "8", difficulty: "easy" },
    { id: "disc2", field: "discrete_math", question: "What is 5! (5 factorial)?", options: ["120", "25", "60", "24"], correct: "120", difficulty: "easy" },
    { id: "disc3", field: "discrete_math", question: "In graph theory, what is a vertex with degree 0 called?", options: ["Isolated vertex", "Pendant vertex", "Hub", "Source"], correct: "Isolated vertex", difficulty: "medium" },
    { id: "disc4", field: "discrete_math", question: "C(5,2) equals?", options: ["10", "20", "25", "5"], correct: "10", difficulty: "easy" },
    
    // Differential Equations
    { id: "diff1", field: "differential_equations", question: "What is the order of dy/dx + y = 0?", options: ["1", "2", "0", "3"], correct: "1", difficulty: "easy" },
    { id: "diff2", field: "differential_equations", question: "The general solution of dy/dx = 2x is?", options: ["y = x² + C", "y = 2x + C", "y = x²", "y = 2"], correct: "y = x² + C", difficulty: "easy" },
    { id: "diff3", field: "differential_equations", question: "y'' + y = 0 has solutions involving?", options: ["sin and cos", "e^x", "polynomials", "log"], correct: "sin and cos", difficulty: "medium" },
    { id: "diff4", field: "differential_equations", question: "A separable DE can be written as?", options: ["f(x)dx = g(y)dy", "f(x,y)dx", "f(y)dx", "None"], correct: "f(x)dx = g(y)dy", difficulty: "medium" },
  ];
  
  // Filter questions based on selected fields and return 3-4 per field
  let filteredQuestions: typeof allQuestions = [];
  selectedFields.forEach(field => {
    const fieldQuestions = allQuestions.filter(q => q.field === field);
    filteredQuestions = [...filteredQuestions, ...fieldQuestions.slice(0, 4)];
  });
  
  // Ensure minimum 15 questions
  if (filteredQuestions.length < 15) {
    const remaining = allQuestions.filter(q => !filteredQuestions.includes(q));
    filteredQuestions = [...filteredQuestions, ...remaining.slice(0, 15 - filteredQuestions.length)];
  }
  
  return filteredQuestions;
};

const ProgramLearning = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Subject, 2: Fields, 3: Time, 4: Assessment, 5: Plan
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

  useEffect(() => {
    loadExistingPlans();
  }, [user]);

  const loadExistingPlans = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('learning_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (data) {
      setExistingPlans(data);
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
    const questions = generateMathAssessment(selectedFields);
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
    const fieldsToStudy = selectedFields.map(f => ({
      id: f,
      name: mathFields.find(mf => mf.id === f)?.name || f,
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
    
    const planName = `Math Mastery - ${selectedFields.length} Fields`;
    
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
                    disabled={subject.id !== "math"} // Only math enabled for now
                    className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                      selectedSubject === subject.id
                        ? "border-primary bg-primary/10"
                        : subject.id === "math"
                        ? "border-border hover:border-primary/50"
                        : "border-border opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <subject.icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">{subject.name}</span>
                    {subject.id !== "math" && (
                      <Badge variant="secondary" className="mt-1 text-xs">Coming Soon</Badge>
                    )}
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
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Select Fields to Study
              </CardTitle>
              <CardDescription>Choose the mathematical areas you want to focus on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {mathFields.map((field) => (
                  <button
                    key={field.id}
                    onClick={() => handleFieldToggle(field.id)}
                    className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                      selectedFields.includes(field.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{field.icon}</span>
                    <span className="text-sm font-medium text-left">{field.name}</span>
                    {selectedFields.includes(field.id) && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={selectedFields.length === 0}>
                  Continue ({selectedFields.length} selected)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {mathFields.find(f => f.id === assessmentQuestions[currentQuestion].field)?.name}
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
              <Button className="flex-1" onClick={() => navigate("/gamemodes")}>
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