export interface Lesson {
  id: string;
  title: string;
  videoId: string;
  worksheetProblems: WorksheetProblem[];
  quizQuestions: QuizQuestion[];
  keyTakeaways: string[];
}

export interface WorksheetProblem {
  id: number;
  problem: string;
  type: "text";
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: string;
}

export interface Chapter {
  id: string;
  name: string;
  lessons: Lesson[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  chapters: Chapter[];
}

export const lessonData: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "📊",
    chapters: [
      {
        id: "algebra",
        name: "Algebra",
        lessons: [
          {
            id: "intro-variables",
            title: "Introduction to Variables",
            videoId: "NybHckSEQBI",
            worksheetProblems: [
              { id: 1, problem: "If x = 5, what is 3x + 2?", type: "text" },
              { id: 2, problem: "Solve for y: y + 7 = 12", type: "text" },
              { id: 3, problem: "What is the value of 2a when a = 8?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What is a variable?",
                options: ["A fixed number", "A letter representing an unknown value", "A mathematical operation", "A type of equation"],
                correct: "A letter representing an unknown value"
              },
              {
                id: 2,
                question: "In the expression 5x, what does x represent?",
                options: ["Always equals 5", "Multiplication", "An unknown number", "Division"],
                correct: "An unknown number"
              },
              {
                id: 3,
                question: "Which is an example of a variable?",
                options: ["7", "+", "y", "="],
                correct: "y"
              }
            ],
            keyTakeaways: [
              "Variables are letters that represent unknown or changing values",
              "Variables allow us to write general mathematical relationships",
              "The same variable always represents the same value in a given problem"
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to find a lesson by subject, chapter, and lesson IDs
export function findLesson(subjectId: string, chapterId: string, lessonId: string): Lesson | null {
  const subject = lessonData.find(s => s.id === subjectId);
  if (!subject) return null;
  
  const chapter = subject.chapters.find(c => c.id === chapterId);
  if (!chapter) return null;
  
  const lesson = chapter.lessons.find(l => l.id === lessonId);
  return lesson || null;
}
