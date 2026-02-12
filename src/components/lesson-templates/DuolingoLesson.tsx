import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2, Check, X } from "lucide-react";

interface Exercise {
  type: "translate" | "select" | "speak" | "match";
  question: string;
  options?: string[];
  correctAnswer: string;
  audio?: string;
}

export const DuolingoLesson = ({ onComplete }: { onComplete: () => void }) => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const exercises: Exercise[] = [
    {
      type: "translate",
      question: "Translate: 'Hello, how are you?'",
      options: ["Hola, ¿cómo estás?", "Adiós", "Buenos días", "Gracias"],
      correctAnswer: "Hola, ¿cómo estás?"
    },
    {
      type: "select",
      question: "Which word means 'cat'?",
      options: ["perro", "gato", "casa", "libro"],
      correctAnswer: "gato"
    },
    {
      type: "translate",
      question: "Translate: 'I love learning'",
      options: ["Me encanta aprender", "No me gusta", "Estoy cansado", "Tengo hambre"],
      correctAnswer: "Me encanta aprender"
    }
  ];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === exercises[currentExercise].correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(score + 1);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer("");
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      onComplete();
    }
  };

  const progress = ((currentExercise + 1) / exercises.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Progress value={progress} className="h-3" />
      
      <Card className="border-2 border-primary">
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">{exercises[currentExercise].question}</h3>
              {exercises[currentExercise].audio && (
                <Button variant="outline" size="lg" className="rounded-full">
                  <Volume2 className="h-6 w-6" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {exercises[currentExercise].options?.map((option, idx) => (
                <Button
                  key={idx}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className="h-auto py-6 text-lg"
                >
                  {option}
                </Button>
              ))}
            </div>

            {showResult && (
              <Card className={isCorrect ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    {isCorrect ? (
                      <>
                        <Check className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="text-xl font-bold text-green-800">Correct!</h4>
                          <p className="text-green-700">Great job! Keep it up!</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <X className="h-8 w-8 text-red-600" />
                        <div>
                          <h4 className="text-xl font-bold text-red-800">Not quite</h4>
                          <p className="text-red-700">
                            The correct answer is: {exercises[currentExercise].correctAnswer}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <Button onClick={handleNext} className="w-full mt-4" size="lg">
                    {currentExercise < exercises.length - 1 ? "Continue" : "Complete Lesson"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground">
        Exercise {currentExercise + 1} of {exercises.length}
      </div>
    </div>
  );
};