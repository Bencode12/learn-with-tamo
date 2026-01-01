import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowLeft, Code, School, User, Briefcase, Presentation, Heart, Clock, Target, Play, CheckCircle, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ProgramLearning = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Topics, 2: Timeframe, 3: Assessment, 4: Plan

  // Step 1: Topic Selection
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Step 2: Timeframe Selection
  const [timeFrame, setTimeFrame] = useState<string>("");
  
  // Step 3: Assessment Answers
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});

  const learningTopics = [
    { id: "math", name: "Mathematics", icon: Code },
    { id: "science", name: "Science", icon: School },
    { id: "history", name: "History", icon: BookOpen },
    { id: "literature", name: "Literature", icon: BookOpen },
    { id: "languages", name: "Languages", icon: User },
    { id: "coding", name: "Programming", icon: Code },
    { id: "art", name: "Art & Design", icon: User },
    { id: "music", name: "Music", icon: User },
  ];

  const timeFrames = [
    { id: "1week", label: "1 week intensive (5+ hours/day)", value: "1week" },
    { id: "2weeks", label: "2 weeks balanced (3-4 hours/day)", value: "2weeks" },
    { id: "1month", label: "1 month relaxed (1-2 hours/day)", value: "1month" },
    { id: "custom", label: "Custom schedule", value: "custom" },
  ];

  const assessmentQuestions = [
    {
      id: "math-basics",
      topic: "Mathematics",
      question: "What is 2 + 2?",
      options: ["2", "3", "4", "5"],
      correct: "4"
    },
    {
      id: "science-basics",
      topic: "Science",
      question: "What is the chemical symbol for water?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      correct: "H2O"
    },
    {
      id: "history-basics",
      topic: "History",
      question: "In which year did World War II end?",
      options: ["1943", "1945", "1950", "1939"],
      correct: "1945"
    }
  ];

  const learningPlan = [
    {
      week: 1,
      goals: [
        "Master basic arithmetic operations",
        "Understand chemical compounds",
        "Learn key historical events"
      ],
      timeCommitment: "3-4 hours",
      activities: [
        { name: "Interactive lessons", duration: "90 min" },
        { name: "Practice exercises", duration: "90 min" },
        { name: "Weekly quiz", duration: "30 min" }
      ]
    },
    {
      week: 2,
      goals: [
        "Solve algebraic equations",
        "Study cell biology basics",
        "Explore ancient civilizations"
      ],
      timeCommitment: "3-4 hours",
      activities: [
        { name: "Video tutorials", duration: "60 min" },
        { name: "Problem sets", duration: "120 min" },
        { name: "Peer discussion", duration: "30 min" }
      ]
    }
  ];

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId) 
        : [...prev, topicId]
    );
  };

  const handleAssessmentAnswer = (questionId: string, answer: string) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const startProgram = () => {
    // In a real app, this would start the actual program
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backTo')} Game Modes
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Program Learning</h2>
          <p className="text-muted-foreground">
            Personalized learning pathway based on your goals and proficiency
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{step} of 4</span>
            </div>
            <Progress value={(step / 4) * 100} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              <span>Topics</span>
              <span>Time</span>
              <span>Assessment</span>
              <span>Plan</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Topic Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Select Your Learning Topics
              </CardTitle>
              <CardDescription>
                Choose the subjects you want to focus on in your personalized learning program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {learningTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                      selectedTopics.includes(topic.id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-border hover:border-blue-300"
                    }`}
                  >
                    <topic.icon className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">{topic.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button 
                  onClick={nextStep} 
                  disabled={selectedTopics.length === 0}
                >
                  Continue to Timeframe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Timeframe Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Select Your Learning Timeframe
              </CardTitle>
              <CardDescription>
                How much time can you dedicate to learning each day?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={timeFrame} 
                onValueChange={setTimeFrame}
                className="space-y-4 mb-6"
              >
                {timeFrames.map((time) => (
                  <div key={time.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={time.value} id={time.id} />
                    <label htmlFor={time.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {time.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button 
                  onClick={nextStep} 
                  disabled={!timeFrame}
                >
                  Continue to Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Assessment */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2 text-blue-500" />
                Quick Assessment
              </CardTitle>
              <CardDescription>
                Answer a few questions to help us understand your current proficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mb-6">
                {assessmentQuestions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <h3 className="font-medium">
                      {question.topic}: {question.question}
                    </h3>
                    <RadioGroup
                      onValueChange={(value) => handleAssessmentAnswer(question.id, value)}
                      className="space-y-2"
                    >
                      {question.options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                          <label 
                            htmlFor={`${question.id}-${idx}`} 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={Object.keys(assessmentAnswers).length !== assessmentQuestions.length}
                >
                  Generate Learning Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Learning Plan */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                Your Personalized Learning Plan
              </CardTitle>
              <CardDescription>
                Based on your selections and assessment results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <h3 className="font-semibold mb-2">Program Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-medium">{selectedTopics.length}</span> topics
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-medium">{timeFrame === '1week' ? '1 week' : timeFrame === '2weeks' ? '2 weeks' : '1 month'}</span> duration
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        <span className="font-medium">3-4 hrs</span> per day
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Weekly Breakdown</h3>
                  {learningPlan.map((week, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">Week {week.week}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Learning Goals</h4>
                            <ul className="space-y-1">
                              {week.goals.map((goal, goalIdx) => (
                                <li key={goalIdx} className="text-sm flex items-start">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Activities</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {week.activities.map((activity, actIdx) => (
                                <div key={actIdx} className="p-2 bg-muted rounded text-sm">
                                  <div className="font-medium">{activity.name}</div>
                                  <div className="text-muted-foreground text-xs">{activity.duration}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <span className="text-sm">
                              <span className="font-medium">Time commitment:</span> {week.timeCommitment} per day
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
                <Button onClick={startProgram}>
                  Start Learning Program
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProgramLearning;