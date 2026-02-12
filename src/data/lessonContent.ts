export interface Lesson {
  id: string;
  title: string;
  videoId: string;
  worksheetProblems: WorksheetProblem[];
  quizQuestions: QuizQuestion[];
  keyTakeaways: string[];
  type?: 'video' | 'duolingo' | 'leetcode' | 'brilliant';
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

export interface Field {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  isPremium?: boolean;
  fields?: Field[];
  chapters?: Chapter[];
}

const algebraLessons: Chapter[] = [
  {
    id: "foundations",
    name: "Foundations",
    lessons: [
      { id: "intro-variables", title: "Introduction to Variables", videoId: "NybHckSEQBI", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "If x = 5, what is 3x + 2?", type: "text" },
          { id: 2, problem: "Solve for y: y + 7 = 12", type: "text" },
          { id: 3, problem: "What is the value of 2a when a = 8?", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "What is a variable?", options: ["A fixed number", "A letter representing an unknown value", "A mathematical operation", "A type of equation"], correct: "A letter representing an unknown value" },
          { id: 2, question: "In 5x, what does x represent?", options: ["Always equals 5", "Multiplication", "An unknown number", "Division"], correct: "An unknown number" },
          { id: 3, question: "Which is an example of a variable?", options: ["7", "+", "y", "="], correct: "y" }
        ],
        keyTakeaways: ["Variables represent unknown or changing values", "Variables allow us to write general relationships", "The same variable represents the same value in a problem"]
      },
      { id: "expressions", title: "Algebraic Expressions", videoId: "9DxrF6Ttws4", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Simplify: 3x + 2x", type: "text" },
          { id: 2, problem: "Evaluate 4y - 3 when y = 5", type: "text" },
          { id: 3, problem: "Write an expression for 'twice a number plus five'", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "What is 3x + 2x?", options: ["5x", "6x", "5x²", "32x"], correct: "5x" },
          { id: 2, question: "Like terms have:", options: ["Same coefficients", "Same variables with same exponents", "Same exponents only", "Nothing in common"], correct: "Same variables with same exponents" },
          { id: 3, question: "Coefficient of 7x is:", options: ["x", "7", "7x", "1"], correct: "7" }
        ],
        keyTakeaways: ["Combine like terms to simplify", "Coefficients are numbers multiplying variables", "Order of operations applies to expressions"]
      },
      { id: "order-operations", title: "Order of Operations", videoId: "dAgfnK528RA", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Calculate: 3 + 4 × 5", type: "text" },
          { id: 2, problem: "Evaluate: (2 + 3)² - 4", type: "text" },
          { id: 3, problem: "Simplify: 24 ÷ 6 + 2 × 3", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "PEMDAS stands for:", options: ["Please Excuse My Dear Aunt Sally", "Parentheses, Exponents, Multiply, Divide, Add, Subtract", "Both A and B", "None of these"], correct: "Both A and B" },
          { id: 2, question: "What is 8 + 2 × 3?", options: ["30", "14", "18", "24"], correct: "14" },
          { id: 3, question: "Evaluate: (4 + 2) × 3", options: ["10", "18", "14", "12"], correct: "18" }
        ],
        keyTakeaways: ["PEMDAS: Parentheses, Exponents, Multiply/Divide, Add/Subtract", "Multiply and divide left to right", "Add and subtract left to right"]
      }
    ]
  },
  {
    id: "linear-equations",
    name: "Linear Equations",
    lessons: [
      { id: "one-step", title: "One-Step Equations", videoId: "l3XzepN03KQ", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Solve: x + 5 = 12", type: "text" },
          { id: 2, problem: "Solve: 3y = 15", type: "text" },
          { id: 3, problem: "Solve: z - 8 = 4", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "To solve x + 5 = 12, you:", options: ["Add 5 to both sides", "Subtract 5 from both sides", "Multiply both sides by 5", "Divide both sides by 5"], correct: "Subtract 5 from both sides" },
          { id: 2, question: "If 4x = 20, then x =", options: ["5", "4", "16", "80"], correct: "5" },
          { id: 3, question: "Inverse operation of addition is:", options: ["Multiplication", "Division", "Subtraction", "Exponentiation"], correct: "Subtraction" }
        ],
        keyTakeaways: ["Use inverse operations to isolate variables", "What you do to one side, do to the other", "Check your answer by substituting back"]
      },
      { id: "two-step", title: "Two-Step Equations", videoId: "LDIiYKYvvdA", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Solve: 2x + 5 = 15", type: "text" },
          { id: 2, problem: "Solve: 3y - 7 = 8", type: "text" },
          { id: 3, problem: "Solve: (x/4) + 3 = 7", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "First step to solve 2x + 5 = 15:", options: ["Divide by 2", "Subtract 5", "Add 5", "Multiply by 2"], correct: "Subtract 5" },
          { id: 2, question: "If 3x - 7 = 8, then x =", options: ["5", "3", "15", "1"], correct: "5" },
          { id: 3, question: "Order for solving: undo ___ first, then ___", options: ["multiply, add", "add, multiply", "exponent, divide", "None"], correct: "add, multiply" }
        ],
        keyTakeaways: ["Undo addition/subtraction first", "Then undo multiplication/division", "Reverse order of operations"]
      },
      { id: "multi-step", title: "Multi-Step Equations", videoId: "9IUEk9fn2Vs", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Solve: 4x + 2 = 2x + 10", type: "text" },
          { id: 2, problem: "Solve: 3(x + 2) = 15", type: "text" },
          { id: 3, problem: "Solve: 5x - 3 = 2x + 9", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "To solve 4x + 2 = 2x + 10, first:", options: ["Divide by 4", "Subtract 2x from both sides", "Add 10", "Subtract 2"], correct: "Subtract 2x from both sides" },
          { id: 2, question: "3(x + 2) = 15 gives x =", options: ["3", "5", "7", "13"], correct: "3" },
          { id: 3, question: "Distributive property: a(b+c) =", options: ["ab + c", "ab + ac", "a + bc", "abc"], correct: "ab + ac" }
        ],
        keyTakeaways: ["Combine like terms on each side first", "Get all variables on one side", "Use distributive property when needed"]
      },
      { id: "word-problems", title: "Word Problems", videoId: "6_VnVSB_Kno", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "The sum of a number and 7 is 15. Find the number.", type: "text" },
          { id: 2, problem: "Three times a number minus 4 equals 11. Find the number.", type: "text" },
          { id: 3, problem: "A rectangle's length is twice its width. If perimeter is 24, find dimensions.", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "'Sum' in word problems means:", options: ["Subtract", "Add", "Multiply", "Divide"], correct: "Add" },
          { id: 2, question: "'Twice a number' is written as:", options: ["x + 2", "x - 2", "2x", "x/2"], correct: "2x" },
          { id: 3, question: "First step in solving word problems:", options: ["Guess the answer", "Identify what you're solving for", "Do arithmetic", "Give up"], correct: "Identify what you're solving for" }
        ],
        keyTakeaways: ["Define variables for unknowns", "Translate words to mathematical expressions", "Set up and solve the equation"]
      }
    ]
  },
  {
    id: "inequalities",
    name: "Inequalities",
    lessons: [
      { id: "graphing-inequalities", title: "Graphing Inequalities", videoId: "P_-c9D5nAMg", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Graph: x > 3", type: "text" },
          { id: 2, problem: "Graph: y ≤ -2", type: "text" },
          { id: 3, problem: "Write the inequality shown: open circle at 5, arrow pointing left", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "Open circle means:", options: ["Includes the point", "Excludes the point", "No solution", "All numbers"], correct: "Excludes the point" },
          { id: 2, question: "x ≥ 4 means x is:", options: ["Greater than 4", "Less than 4", "Greater than or equal to 4", "Equal to 4"], correct: "Greater than or equal to 4" },
          { id: 3, question: "Closed circle is used for:", options: ["< and >", "≤ and ≥", "= only", "None"], correct: "≤ and ≥" }
        ],
        keyTakeaways: ["Open circle for < or >", "Closed circle for ≤ or ≥", "Arrow shows direction of solutions"]
      },
      { id: "solving-inequalities", title: "Solving Inequalities", videoId: "VgDe_D8ojxw", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Solve: x + 3 < 7", type: "text" },
          { id: 2, problem: "Solve: 2x ≥ 10", type: "text" },
          { id: 3, problem: "Solve: -3x > 9", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "When multiplying by negative, you must:", options: ["Do nothing special", "Flip the inequality sign", "Change to equation", "Eliminate variable"], correct: "Flip the inequality sign" },
          { id: 2, question: "If x + 3 < 7, then x <", options: ["4", "10", "3", "7"], correct: "4" },
          { id: 3, question: "-2x > 6 gives x:", options: ["> -3", "< -3", "> 3", "< 3"], correct: "< -3" }
        ],
        keyTakeaways: ["Solve like equations with one exception", "Flip sign when multiplying/dividing by negative", "Check solution with a test point"]
      }
    ]
  },
  {
    id: "polynomials",
    name: "Polynomials",
    lessons: [
      { id: "intro-polynomials", title: "Introduction to Polynomials", videoId: "ffLLmV4mZwU", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Identify the degree of: 3x² + 2x - 5", type: "text" },
          { id: 2, problem: "Classify: 4x³ - 2x + 1", type: "text" },
          { id: 3, problem: "Add: (2x² + 3x) + (x² - 2x + 4)", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "A monomial has:", options: ["One term", "Two terms", "Three terms", "Many terms"], correct: "One term" },
          { id: 2, question: "Degree of 5x³ + 2x is:", options: ["5", "3", "2", "1"], correct: "3" },
          { id: 3, question: "Binomial means:", options: ["1 term", "2 terms", "3 terms", "4 terms"], correct: "2 terms" }
        ],
        keyTakeaways: ["Degree is highest exponent", "Mono=1, Bi=2, Tri=3, Poly=many terms", "Add polynomials by combining like terms"]
      },
      { id: "multiplying-polynomials", title: "Multiplying Polynomials", videoId: "Z8j5RDOibV4", type: "brilliant",
        worksheetProblems: [
          { id: 1, problem: "Multiply: 2x(x + 3)", type: "text" },
          { id: 2, problem: "Expand: (x + 2)(x + 5)", type: "text" },
          { id: 3, problem: "Expand: (x - 3)²", type: "text" }
        ],
        quizQuestions: [
          { id: 1, question: "2x(x + 3) equals:", options: ["2x² + 3", "2x² + 6x", "2x + 6x", "x² + 6x"], correct: "2x² + 6x" },
          { id: 2, question: "FOIL stands for:", options: ["First, Outer, Inner, Last", "First, Only, Inner, Last", "Four Operations In Lines", "None"], correct: "First, Outer, Inner, Last" },
          { id: 3, question: "(x + 2)(x + 3) =", options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5", "2x + 6"], correct: "x² + 5x + 6" }
        ],
        keyTakeaways: ["Distribute each term", "Use FOIL for binomials", "Combine like terms after multiplying"]
      }
    ]
  }
];

export const lessonData: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "📊",
    isPremium: false,
    fields: [
      { id: "algebra", name: "Algebra 1", chapters: algebraLessons },
      { id: "geometry", name: "Geometry", chapters: [
        { id: "basic-shapes", name: "Basic Shapes", lessons: [
          { id: "polygons", title: "Polygons and Properties", videoId: "WLwvByT8aqw", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "Calculate the area of a rectangle with length 8 and width 5", type: "text" }],
            quizQuestions: [{ id: 1, question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: "6" }],
            keyTakeaways: ["Polygons are closed shapes with straight sides"]
          }
        ]},
        { id: "triangles", name: "Triangles", lessons: [
          { id: "triangle-types", title: "Types of Triangles", videoId: "tLfVVlzLGso", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "Find the missing angle in a triangle with angles 45° and 65°", type: "text" }],
            quizQuestions: [{ id: 1, question: "Sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correct: "180°" }],
            keyTakeaways: ["Triangle angles always sum to 180°"]
          }
        ]}
      ]},
      { id: "calculus", name: "Calculus", chapters: [
        { id: "limits", name: "Limits", lessons: [
          { id: "intro-limits", title: "Introduction to Limits", videoId: "riXcZT2ICjA", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "Find lim(x→2) of (x² - 4)/(x - 2)", type: "text" }],
            quizQuestions: [{ id: 1, question: "What does a limit describe?", options: ["Maximum value", "Value function approaches", "Derivative", "Area"], correct: "Value function approaches" }],
            keyTakeaways: ["Limits describe behavior as x approaches a value"]
          }
        ]},
        { id: "derivatives", name: "Derivatives", lessons: [
          { id: "derivative-rules", title: "Derivative Rules", videoId: "WUvTyaaNkzM", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "Find d/dx of x³", type: "text" }],
            quizQuestions: [{ id: 1, question: "The derivative measures:", options: ["Area", "Rate of change", "Sum", "Product"], correct: "Rate of change" }],
            keyTakeaways: ["Derivatives measure instantaneous rate of change"]
          }
        ]}
      ]},
      { id: "trigonometry", name: "Trigonometry", chapters: [
        { id: "basic-trig", name: "Basic Trigonometry", lessons: [
          { id: "sohcahtoa", title: "SOH CAH TOA", videoId: "Jsiy4TxgIME", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "Find sin(30°)", type: "text" }],
            quizQuestions: [{ id: 1, question: "SOH means:", options: ["Sin = Opposite/Hypotenuse", "Sin = Adjacent/Hypotenuse", "Cos = Opposite/Hypotenuse", "Tan = Opposite/Adjacent"], correct: "Sin = Opposite/Hypotenuse" }],
            keyTakeaways: ["SOH CAH TOA for right triangle ratios"]
          }
        ]}
      ]}
    ]
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    isPremium: false,
    fields: [
      { id: "physics", name: "Physics", chapters: [
        { id: "mechanics", name: "Classical Mechanics", lessons: [
          { id: "motion", title: "Motion and Kinematics", videoId: "ZM8ECpBuQYE", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "A car travels 100m in 5s. Calculate its speed.", type: "text" }],
            quizQuestions: [{ id: 1, question: "Speed is:", options: ["Distance × Time", "Distance / Time", "Time / Distance", "Velocity × Time"], correct: "Distance / Time" }],
            keyTakeaways: ["Speed = distance / time"]
          }
        ]}
      ]},
      { id: "chemistry", name: "Chemistry", chapters: [
        { id: "atomic", name: "Atomic Structure", lessons: [
          { id: "atoms", title: "Atoms and Elements", videoId: "FSyAehMdpyI", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "How many protons does Carbon-12 have?", type: "text" }],
            quizQuestions: [{ id: 1, question: "Protons are found in:", options: ["Electron cloud", "Nucleus", "Orbit", "Shell"], correct: "Nucleus" }],
            keyTakeaways: ["Atoms have protons, neutrons, electrons"]
          }
        ]}
      ]},
      { id: "biology", name: "Biology", chapters: [
        { id: "cells", name: "Cell Biology", lessons: [
          { id: "cell-structure", title: "Cell Structure", videoId: "URUJD5NEXC8", type: "brilliant",
            worksheetProblems: [{ id: 1, problem: "List 3 differences between plant and animal cells", type: "text" }],
            quizQuestions: [{ id: 1, question: "The 'powerhouse' of the cell is:", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], correct: "Mitochondria" }],
            keyTakeaways: ["Cells are the basic unit of life"]
          }
        ]}
      ]}
    ]
  },
  {
    id: "cs",
    name: "Computer Science",
    icon: "💻",
    isPremium: true,
    fields: [
      { id: "programming", name: "Programming", chapters: [
        { id: "basics", name: "Programming Basics", lessons: [
          { id: "variables-types", title: "Variables and Data Types", videoId: "Kp4Mvapo5kc", type: "leetcode",
            worksheetProblems: [{ id: 1, problem: "Declare a variable to store your age", type: "text" }],
            quizQuestions: [{ id: 1, question: "Which stores whole numbers?", options: ["float", "string", "int", "boolean"], correct: "int" }],
            keyTakeaways: ["Variables store data in memory"]
          }
        ]}
      ]}
    ]
  },
  {
    id: "language",
    name: "Language Arts",
    icon: "📝",
    isPremium: false,
    chapters: [
      { id: "grammar", name: "Grammar", lessons: [
        { id: "parts-of-speech", title: "Parts of Speech", videoId: "SceDmiBEFhw", type: "duolingo",
          worksheetProblems: [{ id: 1, problem: "Identify the nouns in: 'The cat sat on the mat.'", type: "text" }],
          quizQuestions: [{ id: 1, question: "A word that names a person, place, or thing is:", options: ["Verb", "Noun", "Adjective", "Adverb"], correct: "Noun" }],
          keyTakeaways: ["Nouns name people, places, things, ideas"]
        }
      ]}
    ]
  }
];

export function findLesson(subjectId: string, chapterId: string, lessonId: string): Lesson | null {
  const subject = lessonData.find(s => s.id === subjectId);
  if (!subject) return null;
  
  // Check fields first (new structure)
  if (subject.fields) {
    for (const field of subject.fields) {
      const chapter = field.chapters.find(c => c.id === chapterId);
      if (chapter) {
        const lesson = chapter.lessons.find(l => l.id === lessonId);
        if (lesson) return lesson;
      }
    }
  }
  
  // Fall back to chapters (old structure)
  if (subject.chapters) {
    const chapter = subject.chapters.find(c => c.id === chapterId);
    if (chapter) {
      return chapter.lessons.find(l => l.id === lessonId) || null;
    }
  }
  
  return null;
}

export function getAccessibleSubjects(isPremium: boolean): Subject[] {
  if (isPremium) return lessonData;
  return lessonData.filter(s => !s.isPremium);
}

export function lessonTitleToId(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
