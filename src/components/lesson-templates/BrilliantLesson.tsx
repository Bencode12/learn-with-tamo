import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Check, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface InteractiveProblem {
  question: string;
  type: "input" | "slider" | "multiple";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  visualization?: string;
}

export const BrilliantLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const problems: InteractiveProblem[] = [
    {
      question: "If a ball is dropped from a height of 10 meters, how long does it take to hit the ground? (g = 10 m/s²)",
      type: "input",
      correctAnswer: "1.41",
      explanation: "Using h = ½gt², we get 10 = ½(10)t², solving for t gives us approximately 1.41 seconds.",
      visualization: "🏀"
    },
    {
      question: "What is the area of a circle with radius 5?",
      type: "multiple",
      options: ["78.54", "31.42", "25", "50"],
      correctAnswer: "78.54",
      explanation: "Area = πr² = 3.14159 × 5² ≈ 78.54 square units"
    },
    {
      question: "In a right triangle, if one leg is 3 and the other is 4, what is the hypotenuse?",
      type: "input",
      correctAnswer: "5",
      explanation: "Using the Pythagorean theorem: c² = a² + b² = 3² + 4² = 9 + 16 = 25, so c = 5"
    }
  ];

  const checkAnswer = () => {
    const correct = answer.toLowerCase().trim() === problems[currentProblem].correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      toast.success("Correct!");
    } else {
      toast.error("Try again!");
    }
  };

  const handleNext = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      setAnswer("");
      setShowExplanation(false);
    } else {
      onComplete();
    }
  };

  const progress = ((currentProblem + 1) / problems.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Progress value={progress} className="h-3" />

      <Card className="border-2 border-primary">
        <CardContent className="p-8 space-y-6">
          {/* Visualization */}
          {problems[currentProblem].visualization && (
            <div className="text-center text-6xl mb-6">
              {problems[currentProblem].visualization}
            </div>
          )}

          {/* Question */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">{problems[currentProblem].question}</h3>
          </div>

          {/* Answer Input */}
          {problems[currentProblem].type === "input" && (
            <div className="max-w-md mx-auto">
              <Label htmlFor="answer" className="text-lg mb-2">Your Answer:</Label>
              <Input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="text-lg py-6"
                disabled={showExplanation && isCorrect}
              />
            </div>
          )}

          {/* Multiple Choice */}
          {problems[currentProblem].type === "multiple" && (
            <div className="grid grid-cols-2 gap-4">
              {problems[currentProblem].options?.map((option, idx) => (
                <Button
                  key={idx}
                  variant={answer === option ? "default" : "outline"}
                  size="lg"
                  onClick={() => setAnswer(option)}
                  disabled={showExplanation && isCorrect}
                  className="h-20 text-lg"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {!showExplanation && (
            <Button onClick={checkAnswer} size="lg" className="w-full">
              Check Answer
            </Button>
          )}

          {/* Explanation */}
          {showExplanation && (
            <Card className={isCorrect ? "bg-green-50 border-green-500" : "bg-yellow-50 border-yellow-500"}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <Check className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <Lightbulb className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">
                      {isCorrect ? "Perfect!" : "Here's how to solve it:"}
                    </h4>
                    <p className="text-lg leading-relaxed">
                      {problems[currentProblem].explanation}
                    </p>
                  </div>
                </div>
                <Button onClick={handleNext} size="lg" className="w-full mt-4">
                  {currentProblem < problems.length - 1 ? "Continue" : "Complete Lesson"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground">
        Problem {currentProblem + 1} of {problems.length}
      </div>
    </div>
  );
};