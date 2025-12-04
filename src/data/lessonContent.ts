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

export interface Subject {
  id: string;
  name: string;
  icon: string;
  isPremium?: boolean;
  chapters: Chapter[];
}

export const lessonData: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "📊",
    isPremium: false,
    chapters: [
      {
        id: "algebra",
        name: "Algebra",
        lessons: [
          {
            id: "intro-variables",
            title: "Introduction to Variables",
            videoId: "NybHckSEQBI",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "If x = 5, what is 3x + 2?", type: "text" },
              { id: 2, problem: "Solve for y: y + 7 = 12", type: "text" },
              { id: 3, problem: "What is the value of 2a when a = 8?", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "What is a variable?", options: ["A fixed number", "A letter representing an unknown value", "A mathematical operation", "A type of equation"], correct: "A letter representing an unknown value" },
              { id: 2, question: "In the expression 5x, what does x represent?", options: ["Always equals 5", "Multiplication", "An unknown number", "Division"], correct: "An unknown number" },
              { id: 3, question: "Which is an example of a variable?", options: ["7", "+", "y", "="], correct: "y" }
            ],
            keyTakeaways: ["Variables are letters that represent unknown or changing values", "Variables allow us to write general mathematical relationships", "The same variable always represents the same value in a given problem"]
          },
          {
            id: "linear-equations",
            title: "Linear Equations",
            videoId: "9DxrF6Ttws4",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Solve: 2x + 5 = 15", type: "text" },
              { id: 2, problem: "Solve: 3x - 7 = 8", type: "text" },
              { id: 3, problem: "Solve: 4x + 2 = 2x + 10", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "What is the first step to solve 2x + 5 = 15?", options: ["Multiply by 2", "Subtract 5", "Add 5", "Divide by 2"], correct: "Subtract 5" },
              { id: 2, question: "If 3x = 12, what is x?", options: ["3", "4", "9", "36"], correct: "4" },
              { id: 3, question: "What does 'solving for x' mean?", options: ["Eliminating x", "Isolating x on one side", "Adding x", "Guessing x"], correct: "Isolating x on one side" }
            ],
            keyTakeaways: ["Linear equations have variables with power of 1", "Use inverse operations to isolate the variable", "Always perform the same operation on both sides"]
          },
          {
            id: "quadratic-functions",
            title: "Quadratic Functions",
            videoId: "IlNAJl36-10",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Factor: x² + 5x + 6", type: "text" },
              { id: 2, problem: "Solve: x² - 4 = 0", type: "text" },
              { id: 3, problem: "Find the vertex of y = x² - 4x + 3", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "What is the standard form of a quadratic?", options: ["ax + b", "ax² + bx + c", "a/x + b", "√x"], correct: "ax² + bx + c" },
              { id: 2, question: "The graph of a quadratic is called a:", options: ["Line", "Circle", "Parabola", "Hyperbola"], correct: "Parabola" },
              { id: 3, question: "How many solutions can a quadratic have?", options: ["Only 1", "Only 2", "0, 1, or 2", "Infinite"], correct: "0, 1, or 2" }
            ],
            keyTakeaways: ["Quadratics have x² as highest power", "Parabolas open up or down based on leading coefficient", "Vertex is the maximum or minimum point"]
          }
        ]
      },
      {
        id: "geometry",
        name: "Geometry",
        lessons: [
          {
            id: "basic-shapes",
            title: "Basic Shapes",
            videoId: "WLwvByT8aqw",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Calculate the area of a rectangle with length 8 and width 5", type: "text" },
              { id: 2, problem: "Find the perimeter of a square with side 7", type: "text" },
              { id: 3, problem: "Calculate the area of a triangle with base 10 and height 6", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correct: "6" },
              { id: 2, question: "What is the formula for rectangle area?", options: ["a + b", "a × b", "2(a + b)", "a²"], correct: "a × b" },
              { id: 3, question: "All angles in a rectangle are:", options: ["45°", "60°", "90°", "180°"], correct: "90°" }
            ],
            keyTakeaways: ["Polygons are closed shapes with straight sides", "Area measures the space inside a shape", "Perimeter is the distance around a shape"]
          },
          {
            id: "angles-triangles",
            title: "Angles and Triangles",
            videoId: "tLfVVlzLGso",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Find the missing angle in a triangle with angles 45° and 65°", type: "text" },
              { id: 2, problem: "Classify a triangle with angles 60°, 60°, 60°", type: "text" },
              { id: 3, problem: "If two angles are complementary and one is 35°, find the other", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correct: "180°" },
              { id: 2, question: "An angle of 90° is called:", options: ["Acute", "Right", "Obtuse", "Reflex"], correct: "Right" },
              { id: 3, question: "Complementary angles sum to:", options: ["90°", "180°", "270°", "360°"], correct: "90°" }
            ],
            keyTakeaways: ["Triangle angles always sum to 180°", "Angles can be acute, right, or obtuse", "Triangles classified by sides or angles"]
          }
        ]
      },
      {
        id: "calculus",
        name: "Calculus",
        lessons: [
          {
            id: "limits",
            title: "Introduction to Limits",
            videoId: "riXcZT2ICjA",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Find lim(x→2) of (x² - 4)/(x - 2)", type: "text" },
              { id: 2, problem: "Evaluate lim(x→0) of sin(x)/x", type: "text" },
              { id: 3, problem: "Does lim(x→0) of 1/x exist?", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "What does a limit describe?", options: ["Maximum value", "Value function approaches", "Derivative", "Area"], correct: "Value function approaches" },
              { id: 2, question: "lim(x→3) of 5 equals:", options: ["3", "5", "15", "8"], correct: "5" },
              { id: 3, question: "When does a limit not exist?", options: ["Function is continuous", "Left ≠ right limit", "x = 0", "Function is defined"], correct: "Left ≠ right limit" }
            ],
            keyTakeaways: ["Limits describe behavior as x approaches a value", "Left and right limits must match for limit to exist", "Limits are foundational to calculus"]
          },
          {
            id: "derivatives",
            title: "Derivatives",
            videoId: "WUvTyaaNkzM",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Find d/dx of x³", type: "text" },
              { id: 2, problem: "Find d/dx of 5x² + 3x - 2", type: "text" },
              { id: 3, problem: "Find the slope of y = x² at x = 3", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "The derivative measures:", options: ["Area", "Rate of change", "Sum", "Product"], correct: "Rate of change" },
              { id: 2, question: "d/dx of x^n equals:", options: ["x^(n+1)", "nx^(n-1)", "x^n/n", "nx^n"], correct: "nx^(n-1)" },
              { id: 3, question: "Derivative of a constant is:", options: ["1", "0", "The constant", "Undefined"], correct: "0" }
            ],
            keyTakeaways: ["Derivatives measure instantaneous rate of change", "Power rule: d/dx of x^n = nx^(n-1)", "Derivative at a point gives slope of tangent line"]
          }
        ]
      }
    ]
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    isPremium: false,
    chapters: [
      {
        id: "physics",
        name: "Physics",
        lessons: [
          {
            id: "motion",
            title: "Motion and Kinematics",
            videoId: "ZM8ECpBuQYE",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "A car travels 100m in 5s. Calculate its speed.", type: "text" },
              { id: 2, problem: "An object accelerates from 0 to 20 m/s in 4s. Find acceleration.", type: "text" },
              { id: 3, problem: "Calculate distance: initial velocity 5 m/s, acceleration 2 m/s², time 3s", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Speed is:", options: ["Distance × Time", "Distance / Time", "Time / Distance", "Velocity × Time"], correct: "Distance / Time" },
              { id: 2, question: "Acceleration measures:", options: ["Speed", "Change in speed", "Distance", "Time"], correct: "Change in speed" },
              { id: 3, question: "Unit of acceleration:", options: ["m/s", "m/s²", "m²/s", "s/m"], correct: "m/s²" }
            ],
            keyTakeaways: ["Speed = distance / time", "Velocity includes direction", "Acceleration is rate of change of velocity"]
          },
          {
            id: "forces",
            title: "Forces and Newton's Laws",
            videoId: "kKKM8Y-u7ds",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Calculate force: mass 10kg, acceleration 3 m/s²", type: "text" },
              { id: 2, problem: "A 50N force acts on a 5kg object. Find acceleration.", type: "text" },
              { id: 3, problem: "Explain why a book stays on a table using Newton's 3rd law", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "F = ma is Newton's:", options: ["First law", "Second law", "Third law", "Fourth law"], correct: "Second law" },
              { id: 2, question: "Unit of force:", options: ["kg", "m/s", "Newton", "Joule"], correct: "Newton" },
              { id: 3, question: "An object at rest stays at rest unless:", options: ["Pushed", "Acted upon by a force", "Gravity acts", "It moves"], correct: "Acted upon by a force" }
            ],
            keyTakeaways: ["Force = mass × acceleration", "Newton's 1st law: objects resist changes in motion", "Newton's 3rd law: every action has equal opposite reaction"]
          }
        ]
      },
      {
        id: "chemistry",
        name: "Chemistry",
        lessons: [
          {
            id: "atoms",
            title: "Atomic Structure",
            videoId: "FSyAehMdpyI",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "How many protons does Carbon-12 have?", type: "text" },
              { id: 2, problem: "Calculate neutrons in Oxygen-18", type: "text" },
              { id: 3, problem: "What determines an element's identity?", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Protons are found in:", options: ["Electron cloud", "Nucleus", "Orbit", "Shell"], correct: "Nucleus" },
              { id: 2, question: "Electrons have:", options: ["Positive charge", "Negative charge", "No charge", "Variable charge"], correct: "Negative charge" },
              { id: 3, question: "Atomic number equals:", options: ["Neutrons", "Protons", "Electrons", "Mass"], correct: "Protons" }
            ],
            keyTakeaways: ["Atoms have protons, neutrons, electrons", "Protons determine element identity", "Electrons orbit the nucleus in shells"]
          },
          {
            id: "periodic-table",
            title: "The Periodic Table",
            videoId: "rz4Dd1I_fX0",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "Identify the group and period of Sodium (Na)", type: "text" },
              { id: 2, problem: "Why are noble gases unreactive?", type: "text" },
              { id: 3, problem: "Compare properties of metals vs non-metals", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Elements in the same group have:", options: ["Same mass", "Same electrons", "Similar properties", "Same period"], correct: "Similar properties" },
              { id: 2, question: "Alkali metals are in group:", options: ["1", "2", "17", "18"], correct: "1" },
              { id: 3, question: "Noble gases are in group:", options: ["1", "2", "17", "18"], correct: "18" }
            ],
            keyTakeaways: ["Elements arranged by atomic number", "Groups (columns) share properties", "Periods (rows) show electron shell filling"]
          }
        ]
      },
      {
        id: "biology",
        name: "Biology",
        lessons: [
          {
            id: "cells",
            title: "Cell Structure",
            videoId: "URUJD5NEXC8",
            type: "brilliant",
            worksheetProblems: [
              { id: 1, problem: "List 3 differences between plant and animal cells", type: "text" },
              { id: 2, problem: "What is the function of mitochondria?", type: "text" },
              { id: 3, problem: "Explain why the cell membrane is called 'selectively permeable'", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "The 'powerhouse' of the cell is:", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], correct: "Mitochondria" },
              { id: 2, question: "Plant cells have:", options: ["Only nucleus", "Cell wall", "No membrane", "No chloroplasts"], correct: "Cell wall" },
              { id: 3, question: "DNA is found in the:", options: ["Cytoplasm", "Nucleus", "Cell wall", "Vacuole"], correct: "Nucleus" }
            ],
            keyTakeaways: ["Cells are the basic unit of life", "Organelles perform specific functions", "Plant and animal cells have key differences"]
          }
        ]
      }
    ]
  },
  {
    id: "language",
    name: "Language Arts",
    icon: "📝",
    isPremium: false,
    chapters: [
      {
        id: "grammar",
        name: "Grammar",
        lessons: [
          {
            id: "parts-of-speech",
            title: "Parts of Speech",
            videoId: "SceDmiBEFhw",
            type: "duolingo",
            worksheetProblems: [
              { id: 1, problem: "Identify the nouns in: 'The cat sat on the mat.'", type: "text" },
              { id: 2, problem: "Circle the verbs: 'She quickly ran and jumped over the fence.'", type: "text" },
              { id: 3, problem: "Find the adjectives: 'The big, red balloon floated away.'", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "A word that names a person, place, or thing is:", options: ["Verb", "Noun", "Adjective", "Adverb"], correct: "Noun" },
              { id: 2, question: "Which word is a verb?", options: ["Beautiful", "Quickly", "Running", "Happy"], correct: "Running" },
              { id: 3, question: "Adjectives describe:", options: ["Verbs", "Nouns", "Other adjectives", "Sentences"], correct: "Nouns" }
            ],
            keyTakeaways: ["Nouns name people, places, things, ideas", "Verbs show action or state of being", "Adjectives modify nouns"]
          },
          {
            id: "sentence-structure",
            title: "Sentence Structure",
            videoId: "IJEuKIlk7TY",
            type: "duolingo",
            worksheetProblems: [
              { id: 1, problem: "Identify the subject and predicate in: 'The dog barked loudly.'", type: "text" },
              { id: 2, problem: "Combine these sentences: 'I like pizza. I like pasta.'", type: "text" },
              { id: 3, problem: "Fix the run-on sentence: 'I went to the store I bought milk.'", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Every sentence needs a:", options: ["Comma", "Subject and verb", "Question mark", "Three words"], correct: "Subject and verb" },
              { id: 2, question: "A compound sentence has:", options: ["One clause", "Two independent clauses", "Only adjectives", "No verbs"], correct: "Two independent clauses" },
              { id: 3, question: "A fragment is:", options: ["A complete thought", "An incomplete sentence", "A run-on", "A question"], correct: "An incomplete sentence" }
            ],
            keyTakeaways: ["Sentences need subjects and predicates", "Avoid run-ons and fragments", "Compound sentences use conjunctions"]
          }
        ]
      },
      {
        id: "writing",
        name: "Writing",
        lessons: [
          {
            id: "essay-structure",
            title: "Essay Structure",
            videoId: "vtIzMaLkCaM",
            type: "duolingo",
            worksheetProblems: [
              { id: 1, problem: "Write a thesis statement for an essay about climate change", type: "text" },
              { id: 2, problem: "Create an outline for a 5-paragraph essay", type: "text" },
              { id: 3, problem: "Write a strong concluding sentence for a paragraph about exercise benefits", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "A thesis statement should be:", options: ["Vague", "Specific and arguable", "A question", "Very long"], correct: "Specific and arguable" },
              { id: 2, question: "Body paragraphs should start with:", options: ["A quote", "Topic sentence", "Statistics", "Conclusion"], correct: "Topic sentence" },
              { id: 3, question: "The conclusion should:", options: ["Add new info", "Summarize main points", "Be very short", "Ignore the thesis"], correct: "Summarize main points" }
            ],
            keyTakeaways: ["Essays have introduction, body, conclusion", "Each paragraph needs a topic sentence", "Conclusions reinforce the thesis"]
          }
        ]
      }
    ]
  },
  {
    id: "cs",
    name: "Computer Science",
    icon: "💻",
    isPremium: true,
    chapters: [
      {
        id: "programming-basics",
        name: "Programming Basics",
        lessons: [
          {
            id: "variables-types",
            title: "Variables and Data Types",
            videoId: "Kp4Mvapo5kc",
            type: "leetcode",
            worksheetProblems: [
              { id: 1, problem: "Declare a variable to store your age", type: "text" },
              { id: 2, problem: "What data type would you use for a price: $19.99?", type: "text" },
              { id: 3, problem: "Write code to swap two variables without a temp variable", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Which stores whole numbers?", options: ["float", "string", "int", "boolean"], correct: "int" },
              { id: 2, question: "A boolean can be:", options: ["Any number", "True or false", "Text only", "Decimal"], correct: "True or false" },
              { id: 3, question: "'Hello' is a:", options: ["Integer", "Float", "String", "Boolean"], correct: "String" }
            ],
            keyTakeaways: ["Variables store data in memory", "Each variable has a type", "Common types: int, float, string, boolean"]
          },
          {
            id: "loops",
            title: "Loops and Iteration",
            videoId: "wxds6MAtUQ0",
            type: "leetcode",
            worksheetProblems: [
              { id: 1, problem: "Write a for loop that prints 1 to 10", type: "text" },
              { id: 2, problem: "Convert this for loop to a while loop: for(i=0; i<5; i++)", type: "text" },
              { id: 3, problem: "Write a loop to find the sum of numbers 1 to 100", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "A for loop is best when:", options: ["Unknown iterations", "Known iterations", "No iterations", "Infinite loop"], correct: "Known iterations" },
              { id: 2, question: "An infinite loop occurs when:", options: ["Loop runs once", "Condition never false", "Break is used", "i increases"], correct: "Condition never false" },
              { id: 3, question: "'break' does what?", options: ["Skips iteration", "Exits loop", "Restarts loop", "Nothing"], correct: "Exits loop" }
            ],
            keyTakeaways: ["Loops repeat code blocks", "for loops: known iterations", "while loops: condition-based"]
          },
          {
            id: "functions",
            title: "Functions",
            videoId: "u-OmVr_fT4s",
            type: "leetcode",
            worksheetProblems: [
              { id: 1, problem: "Write a function that returns the square of a number", type: "text" },
              { id: 2, problem: "Create a function with default parameters", type: "text" },
              { id: 3, problem: "Write a recursive function for factorial", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Functions help with:", options: ["Making code longer", "Code reusability", "Slowing execution", "Adding errors"], correct: "Code reusability" },
              { id: 2, question: "Parameters are:", options: ["Return values", "Input values", "Loop counters", "Constants"], correct: "Input values" },
              { id: 3, question: "Recursion is when:", options: ["Function loops", "Function calls itself", "Function returns nothing", "Function has no parameters"], correct: "Function calls itself" }
            ],
            keyTakeaways: ["Functions encapsulate reusable code", "Parameters pass data in", "Return values pass data out"]
          }
        ]
      },
      {
        id: "data-structures",
        name: "Data Structures",
        lessons: [
          {
            id: "arrays",
            title: "Arrays and Lists",
            videoId: "pmN9ExDf3yQ",
            type: "leetcode",
            worksheetProblems: [
              { id: 1, problem: "Create an array of 5 numbers and find the maximum", type: "text" },
              { id: 2, problem: "Write code to reverse an array in place", type: "text" },
              { id: 3, problem: "Find the index of element 42 in an array", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Array indices start at:", options: ["1", "0", "-1", "Any number"], correct: "0" },
              { id: 2, question: "Array access time is:", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: "O(1)" },
              { id: 3, question: "To add at the end of a list:", options: ["push/append", "pop", "shift", "unshift"], correct: "push/append" }
            ],
            keyTakeaways: ["Arrays store ordered collections", "Access by index is O(1)", "Dynamic arrays can grow/shrink"]
          }
        ]
      },
      {
        id: "algorithms",
        name: "Algorithms",
        lessons: [
          {
            id: "sorting",
            title: "Sorting Algorithms",
            videoId: "kPRA0W1kECg",
            type: "leetcode",
            worksheetProblems: [
              { id: 1, problem: "Trace bubble sort on [5, 2, 8, 1, 9]", type: "text" },
              { id: 2, problem: "What is the time complexity of merge sort?", type: "text" },
              { id: 3, problem: "When would you use quick sort vs merge sort?", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "Bubble sort time complexity:", options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"], correct: "O(n²)" },
              { id: 2, question: "Which is fastest on average?", options: ["Bubble sort", "Selection sort", "Quick sort", "Insertion sort"], correct: "Quick sort" },
              { id: 3, question: "Merge sort space complexity:", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: "O(n)" }
            ],
            keyTakeaways: ["Different sorts have different trade-offs", "Quick sort is often fastest in practice", "Merge sort guarantees O(n log n)"]
          }
        ]
      }
    ]
  },
  {
    id: "foreign",
    name: "Foreign Languages",
    icon: "🌍",
    isPremium: true,
    chapters: [
      {
        id: "spanish",
        name: "Spanish",
        lessons: [
          {
            id: "greetings",
            title: "Basic Greetings",
            videoId: "OIZ2DRuewds",
            type: "duolingo",
            worksheetProblems: [
              { id: 1, problem: "Translate: 'Good morning'", type: "text" },
              { id: 2, problem: "How do you say 'My name is...'?", type: "text" },
              { id: 3, problem: "Write a short introduction of yourself in Spanish", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "'Hola' means:", options: ["Goodbye", "Hello", "Please", "Thanks"], correct: "Hello" },
              { id: 2, question: "'Buenos días' is used in:", options: ["Evening", "Morning", "Night", "Afternoon"], correct: "Morning" },
              { id: 3, question: "'¿Cómo estás?' means:", options: ["What's your name?", "How are you?", "Where are you?", "How old are you?"], correct: "How are you?" }
            ],
            keyTakeaways: ["Hola = Hello", "Buenos días/tardes/noches = Good morning/afternoon/evening", "¿Cómo estás? = How are you?"]
          },
          {
            id: "numbers",
            title: "Numbers 1-100",
            videoId: "5Q1Dc8vpxT8",
            type: "duolingo",
            worksheetProblems: [
              { id: 1, problem: "Write the numbers 1-10 in Spanish", type: "text" },
              { id: 2, problem: "What is 'treinta y cinco' in numerals?", type: "text" },
              { id: 3, problem: "Write your phone number in Spanish words", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "'Veinte' is:", options: ["12", "20", "22", "30"], correct: "20" },
              { id: 2, question: "How do you say 15?", options: ["Quince", "Cinco", "Cincuenta", "Ciento"], correct: "Quince" },
              { id: 3, question: "'Cien' means:", options: ["10", "50", "100", "1000"], correct: "100" }
            ],
            keyTakeaways: ["Uno, dos, tres... diez", "Numbers 16-19: dieci- prefix", "Numbers 21-29: veinti- prefix"]
          }
        ]
      },
      {
        id: "french",
        name: "French",
        lessons: [
          {
            id: "basics",
            title: "French Basics",
            videoId: "bV55n2p2P7w",
            type: "duolingo",
            worksheetProblems: [
              { id: 1, problem: "Translate: 'Thank you very much'", type: "text" },
              { id: 2, problem: "How do you say 'I don't understand'?", type: "text" },
              { id: 3, problem: "Write 'Nice to meet you' in French", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "'Bonjour' means:", options: ["Goodbye", "Hello", "Please", "Sorry"], correct: "Hello" },
              { id: 2, question: "'Merci' means:", options: ["Sorry", "Please", "Thank you", "Hello"], correct: "Thank you" },
              { id: 3, question: "'Au revoir' means:", options: ["Hello", "Goodbye", "Please", "Thanks"], correct: "Goodbye" }
            ],
            keyTakeaways: ["Bonjour = Hello", "Merci = Thank you", "Au revoir = Goodbye"]
          }
        ]
      }
    ]
  },
  {
    id: "social",
    name: "Social Studies",
    icon: "📚",
    isPremium: false,
    chapters: [
      {
        id: "history",
        name: "History",
        lessons: [
          {
            id: "ancient-civilizations",
            title: "Ancient Civilizations",
            videoId: "b4L5-hKuGqc",
            type: "video",
            worksheetProblems: [
              { id: 1, problem: "Compare the Nile and Tigris-Euphrates river valleys", type: "text" },
              { id: 2, problem: "What inventions came from ancient Mesopotamia?", type: "text" },
              { id: 3, problem: "Why were rivers important for early civilizations?", type: "text" }
            ],
            quizQuestions: [
              { id: 1, question: "The first civilizations developed near:", options: ["Mountains", "Rivers", "Deserts", "Oceans"], correct: "Rivers" },
              { id: 2, question: "Mesopotamia means:", options: ["Land of pharaohs", "Between rivers", "Golden age", "Eastern land"], correct: "Between rivers" },
              { id: 3, question: "Ancient Egypt was along the:", options: ["Amazon", "Nile", "Tigris", "Ganges"], correct: "Nile" }
            ],
            keyTakeaways: ["First civilizations near rivers", "Rivers provided water, transport, fertile soil", "Mesopotamia = 'between rivers'"]
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

// Helper function to get all subjects for a given access level
export function getAccessibleSubjects(isPremium: boolean): Subject[] {
  if (isPremium) return lessonData;
  return lessonData.filter(s => !s.isPremium);
}

// Convert lesson title to URL-safe ID
export function lessonTitleToId(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
