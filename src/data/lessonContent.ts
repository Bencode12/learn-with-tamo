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
          },
          {
            id: "linear-equations",
            title: "Linear Equations",
            videoId: "2V8HH15vHxo",
            worksheetProblems: [
              { id: 1, problem: "Solve: 2x + 5 = 15", type: "text" },
              { id: 2, problem: "Solve: 3y - 7 = 11", type: "text" },
              { id: 3, problem: "Solve: 4x + 3 = 2x + 9", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What is the first step in solving 2x + 5 = 15?",
                options: ["Add 5", "Subtract 5", "Multiply by 2", "Divide by 2"],
                correct: "Subtract 5"
              },
              {
                id: 2,
                question: "What does solving an equation mean?",
                options: ["Making it more complex", "Finding the value of the variable", "Adding numbers", "Removing variables"],
                correct: "Finding the value of the variable"
              },
              {
                id: 3,
                question: "In 3x = 12, what is x?",
                options: ["3", "4", "12", "36"],
                correct: "4"
              }
            ],
            keyTakeaways: [
              "To solve equations, isolate the variable on one side",
              "Use inverse operations to maintain equality",
              "Always check your answer by substituting back"
            ]
          },
          {
            id: "quadratic-functions",
            title: "Quadratic Functions",
            videoId: "-iyiXYr45v4",
            worksheetProblems: [
              { id: 1, problem: "Find the vertex of y = x² - 4x + 3", type: "text" },
              { id: 2, problem: "Factor: x² + 5x + 6", type: "text" },
              { id: 3, problem: "Solve: x² - 9 = 0", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What is the standard form of a quadratic equation?",
                options: ["y = mx + b", "ax² + bx + c = 0", "x + y = z", "y = x³"],
                correct: "ax² + bx + c = 0"
              },
              {
                id: 2,
                question: "The graph of a quadratic function is called a:",
                options: ["Line", "Parabola", "Circle", "Ellipse"],
                correct: "Parabola"
              },
              {
                id: 3,
                question: "What is the highest power of x in a quadratic?",
                options: ["1", "2", "3", "4"],
                correct: "2"
              }
            ],
            keyTakeaways: [
              "Quadratic functions form parabolas when graphed",
              "The vertex represents the minimum or maximum point",
              "Factoring is a key method for solving quadratics"
            ]
          },
          {
            id: "polynomials",
            title: "Polynomials",
            videoId: "Vm7H0VTlIco",
            worksheetProblems: [
              { id: 1, problem: "Add: (3x² + 2x - 1) + (x² - 4x + 5)", type: "text" },
              { id: 2, problem: "Multiply: (x + 3)(x - 2)", type: "text" },
              { id: 3, problem: "Simplify: 5x³ - 2x³ + 7x²", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What is a polynomial?",
                options: ["One term only", "Sum of terms with variables raised to whole number powers", "A fraction", "A square root"],
                correct: "Sum of terms with variables raised to whole number powers"
              },
              {
                id: 2,
                question: "What is the degree of 5x³ + 2x² - x + 7?",
                options: ["1", "2", "3", "5"],
                correct: "3"
              },
              {
                id: 3,
                question: "When adding polynomials, you combine:",
                options: ["Any terms", "Like terms", "All coefficients", "Variables only"],
                correct: "Like terms"
              }
            ],
            keyTakeaways: [
              "Polynomials are expressions with multiple terms",
              "Degree is determined by the highest power of the variable",
              "Combine like terms when adding or subtracting"
            ]
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
            videoId: "rMRhRsEEtkA",
            worksheetProblems: [
              { id: 1, problem: "Find the area of a rectangle with length 8cm and width 5cm", type: "text" },
              { id: 2, problem: "What is the perimeter of a square with side length 6cm?", type: "text" },
              { id: 3, problem: "Calculate the area of a triangle with base 10cm and height 6cm", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "How many sides does a triangle have?",
                options: ["2", "3", "4", "5"],
                correct: "3"
              },
              {
                id: 2,
                question: "What is the formula for the area of a rectangle?",
                options: ["length + width", "length × width", "2(length + width)", "length²"],
                correct: "length × width"
              },
              {
                id: 3,
                question: "A shape with 4 equal sides is called a:",
                options: ["Rectangle", "Triangle", "Square", "Pentagon"],
                correct: "Square"
              }
            ],
            keyTakeaways: [
              "Different shapes have specific properties and formulas",
              "Area measures the space inside a shape",
              "Perimeter measures the distance around a shape"
            ]
          },
          {
            id: "angles-triangles",
            title: "Angles and Triangles",
            videoId: "MxP1VTKP5jI",
            worksheetProblems: [
              { id: 1, problem: "Find the missing angle in a triangle with angles 60° and 80°", type: "text" },
              { id: 2, problem: "What type of triangle has all angles equal to 60°?", type: "text" },
              { id: 3, problem: "If two angles in a triangle are 45° each, what is the third angle?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "The sum of angles in a triangle is:",
                options: ["90°", "180°", "270°", "360°"],
                correct: "180°"
              },
              {
                id: 2,
                question: "A right angle measures:",
                options: ["45°", "60°", "90°", "180°"],
                correct: "90°"
              },
              {
                id: 3,
                question: "An equilateral triangle has:",
                options: ["All sides equal", "All angles equal", "Both all sides and angles equal", "No equal parts"],
                correct: "Both all sides and angles equal"
              }
            ],
            keyTakeaways: [
              "Triangle angles always sum to 180 degrees",
              "Different triangle types have unique properties",
              "Angles are classified by their measure"
            ]
          },
          {
            id: "circles",
            title: "Circles",
            videoId: "WR24ThK_VkY",
            worksheetProblems: [
              { id: 1, problem: "Find the circumference of a circle with radius 5cm (use π ≈ 3.14)", type: "text" },
              { id: 2, problem: "What is the area of a circle with diameter 10cm?", type: "text" },
              { id: 3, problem: "If a circle has circumference 31.4cm, what is its radius?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What is the formula for the circumference of a circle?",
                options: ["πr", "2πr", "πr²", "2πr²"],
                correct: "2πr"
              },
              {
                id: 2,
                question: "The distance from the center to the edge is called the:",
                options: ["Diameter", "Radius", "Circumference", "Arc"],
                correct: "Radius"
              },
              {
                id: 3,
                question: "What is the area formula for a circle?",
                options: ["2πr", "πr²", "πd", "2πr²"],
                correct: "πr²"
              }
            ],
            keyTakeaways: [
              "Circles are defined by their radius or diameter",
              "Circumference and area have specific formulas involving π",
              "Diameter is twice the radius"
            ]
          },
          {
            id: "3d-geometry",
            title: "3D Geometry",
            videoId: "zXcKKSbK4Bc",
            worksheetProblems: [
              { id: 1, problem: "Find the volume of a cube with side length 4cm", type: "text" },
              { id: 2, problem: "Calculate the surface area of a rectangular prism 3×4×5 cm", type: "text" },
              { id: 3, problem: "What is the volume of a cylinder with radius 3cm and height 7cm?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "How many faces does a cube have?",
                options: ["4", "6", "8", "12"],
                correct: "6"
              },
              {
                id: 2,
                question: "What is the formula for the volume of a cube?",
                options: ["s²", "s³", "6s²", "4s"],
                correct: "s³"
              },
              {
                id: 3,
                question: "A sphere is a 3D version of a:",
                options: ["Square", "Triangle", "Circle", "Rectangle"],
                correct: "Circle"
              }
            ],
            keyTakeaways: [
              "3D shapes have volume and surface area",
              "Volume measures space inside a 3D object",
              "Common 3D shapes include cubes, spheres, and cylinders"
            ]
          }
        ]
      },
      {
        id: "calculus",
        name: "Calculus",
        lessons: [
          {
            id: "limits",
            title: "Limits",
            videoId: "riXcZT2ICjA",
            worksheetProblems: [
              { id: 1, problem: "Find lim(x→2) of (x² - 4)/(x - 2)", type: "text" },
              { id: 2, problem: "Evaluate lim(x→0) of sin(x)/x", type: "text" },
              { id: 3, problem: "What is lim(x→∞) of (3x + 1)/(x + 2)?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What does a limit represent?",
                options: ["The exact value at a point", "The value a function approaches", "The derivative", "The integral"],
                correct: "The value a function approaches"
              },
              {
                id: 2,
                question: "Can a limit exist if the function is undefined at that point?",
                options: ["Yes", "No", "Sometimes", "Never"],
                correct: "Yes"
              },
              {
                id: 3,
                question: "What is lim(x→0) of x²?",
                options: ["0", "1", "2", "undefined"],
                correct: "0"
              }
            ],
            keyTakeaways: [
              "Limits describe the behavior of functions as inputs approach a value",
              "Limits can exist even when the function is undefined at that point",
              "Limits are fundamental to understanding calculus"
            ]
          },
          {
            id: "derivatives",
            title: "Derivatives",
            videoId: "N2PpRnFqnqY",
            worksheetProblems: [
              { id: 1, problem: "Find the derivative of f(x) = 3x² + 2x - 1", type: "text" },
              { id: 2, problem: "What is d/dx of sin(x)?", type: "text" },
              { id: 3, problem: "Find f'(x) if f(x) = x³ - 5x", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What does the derivative measure?",
                options: ["Area under curve", "Rate of change", "Total distance", "Average value"],
                correct: "Rate of change"
              },
              {
                id: 2,
                question: "What is the power rule for derivatives?",
                options: ["d/dx(xⁿ) = nxⁿ⁻¹", "d/dx(xⁿ) = xⁿ⁺¹", "d/dx(xⁿ) = nxⁿ", "d/dx(xⁿ) = xⁿ"],
                correct: "d/dx(xⁿ) = nxⁿ⁻¹"
              },
              {
                id: 3,
                question: "The derivative of a constant is:",
                options: ["1", "0", "The constant itself", "Undefined"],
                correct: "0"
              }
            ],
            keyTakeaways: [
              "Derivatives measure instantaneous rate of change",
              "The power rule is a fundamental differentiation technique",
              "Derivatives have applications in optimization and motion"
            ]
          },
          {
            id: "integrals",
            title: "Integrals",
            videoId: "FZHy_1dWGmQ",
            worksheetProblems: [
              { id: 1, problem: "Evaluate ∫(3x² + 2x)dx", type: "text" },
              { id: 2, problem: "Find ∫₀³ x dx", type: "text" },
              { id: 3, problem: "What is ∫cos(x)dx?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What does an integral represent?",
                options: ["Rate of change", "Area under a curve", "Slope", "Maximum value"],
                correct: "Area under a curve"
              },
              {
                id: 2,
                question: "Integration is the inverse of:",
                options: ["Addition", "Multiplication", "Differentiation", "Division"],
                correct: "Differentiation"
              },
              {
                id: 3,
                question: "What is ∫x dx?",
                options: ["x", "x²/2 + C", "2x + C", "x² + C"],
                correct: "x²/2 + C"
              }
            ],
            keyTakeaways: [
              "Integrals calculate accumulated quantities and areas",
              "Integration reverses the process of differentiation",
              "The constant of integration C is important in indefinite integrals"
            ]
          },
          {
            id: "applications",
            title: "Applications of Calculus",
            videoId: "fKIA7HiqqsI",
            worksheetProblems: [
              { id: 1, problem: "Find the maximum value of f(x) = -x² + 4x + 1", type: "text" },
              { id: 2, problem: "A ball is thrown upward with velocity v(t) = 30 - 10t. When does it reach maximum height?", type: "text" },
              { id: 3, problem: "Find the area between y = x² and y = x from x=0 to x=1", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "To find maximum/minimum values, we set the derivative equal to:",
                options: ["1", "0", "∞", "The original function"],
                correct: "0"
              },
              {
                id: 2,
                question: "Calculus can be used to solve problems involving:",
                options: ["Only algebra", "Motion and optimization", "Only geometry", "Only statistics"],
                correct: "Motion and optimization"
              },
              {
                id: 3,
                question: "In physics, velocity is the derivative of:",
                options: ["Acceleration", "Position", "Time", "Force"],
                correct: "Position"
              }
            ],
            keyTakeaways: [
              "Calculus solves real-world optimization problems",
              "Derivatives and integrals model motion and change",
              "Applications span physics, economics, and engineering"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    chapters: [
      {
        id: "physics",
        name: "Physics",
        lessons: [
          {
            id: "motion",
            title: "Motion and Kinematics",
            videoId: "ZM8ECpBuQYE",
            worksheetProblems: [
              { id: 1, problem: "A car travels 120km in 2 hours. What is its average speed?", type: "text" },
              { id: 2, problem: "If velocity = 15 m/s and time = 4s, what is the distance?", type: "text" },
              { id: 3, problem: "An object accelerates from 10 m/s to 30 m/s in 5s. What is the acceleration?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "What is the formula for speed?",
                options: ["Distance + Time", "Distance × Time", "Distance / Time", "Time / Distance"],
                correct: "Distance / Time"
              },
              {
                id: 2,
                question: "Velocity is speed with:",
                options: ["Direction", "Mass", "Force", "Energy"],
                correct: "Direction"
              },
              {
                id: 3,
                question: "Acceleration is the rate of change of:",
                options: ["Position", "Velocity", "Distance", "Force"],
                correct: "Velocity"
              }
            ],
            keyTakeaways: [
              "Motion can be described using position, velocity, and acceleration",
              "Speed = distance/time; velocity includes direction",
              "Acceleration measures how quickly velocity changes"
            ]
          },
          {
            id: "forces",
            title: "Forces and Newton's Laws",
            videoId: "kKKM8Y-u7ds",
            worksheetProblems: [
              { id: 1, problem: "Calculate force: mass = 10kg, acceleration = 5 m/s²", type: "text" },
              { id: 2, problem: "If F = 100N and m = 20kg, what is the acceleration?", type: "text" },
              { id: 3, problem: "A 50kg person stands on Earth. What is their weight? (g = 10 m/s²)", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "Newton's second law states F =",
                options: ["m + a", "m × a", "m / a", "a / m"],
                correct: "m × a"
              },
              {
                id: 2,
                question: "An object at rest stays at rest unless acted upon by a force. This is:",
                options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravity"],
                correct: "Newton's First Law"
              },
              {
                id: 3,
                question: "For every action, there is an equal and opposite:",
                options: ["Force", "Reaction", "Motion", "Energy"],
                correct: "Reaction"
              }
            ],
            keyTakeaways: [
              "Forces cause objects to accelerate",
              "Newton's laws describe how forces affect motion",
              "Force = mass × acceleration (F = ma)"
            ]
          },
          {
            id: "energy",
            title: "Energy and Work",
            videoId: "w4QFJb9a8vo",
            worksheetProblems: [
              { id: 1, problem: "Calculate kinetic energy: mass = 5kg, velocity = 10 m/s", type: "text" },
              { id: 2, problem: "If work = 200J and force = 50N, what is the distance?", type: "text" },
              { id: 3, problem: "Find potential energy: mass = 2kg, height = 10m, g = 10 m/s²", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "The formula for kinetic energy is:",
                options: ["½mv", "mv²", "½mv²", "2mv"],
                correct: "½mv²"
              },
              {
                id: 2,
                question: "Work is calculated as:",
                options: ["Force + Distance", "Force × Distance", "Force / Distance", "Force - Distance"],
                correct: "Force × Distance"
              },
              {
                id: 3,
                question: "Energy cannot be created or destroyed, only:",
                options: ["Lost", "Transformed", "Stopped", "Reversed"],
                correct: "Transformed"
              }
            ],
            keyTakeaways: [
              "Energy exists in multiple forms (kinetic, potential, thermal, etc.)",
              "Work transfers energy to or from objects",
              "Total energy in a closed system is conserved"
            ]
          },
          {
            id: "waves",
            title: "Waves and Sound",
            videoId: "DOSF14dZ_Vo",
            worksheetProblems: [
              { id: 1, problem: "A wave has frequency 50Hz and wavelength 4m. What is its speed?", type: "text" },
              { id: 2, problem: "If wave speed = 340 m/s and wavelength = 2m, find the frequency", type: "text" },
              { id: 3, problem: "How long does it take sound to travel 1020m at 340 m/s?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "The relationship between wave speed, frequency, and wavelength is:",
                options: ["v = f + λ", "v = f × λ", "v = f / λ", "v = λ / f"],
                correct: "v = f × λ"
              },
              {
                id: 2,
                question: "Frequency is measured in:",
                options: ["Meters", "Hertz", "Seconds", "Joules"],
                correct: "Hertz"
              },
              {
                id: 3,
                question: "Sound waves are:",
                options: ["Transverse waves", "Longitudinal waves", "Electromagnetic waves", "Light waves"],
                correct: "Longitudinal waves"
              }
            ],
            keyTakeaways: [
              "Waves transfer energy without transferring matter",
              "Wave speed = frequency × wavelength",
              "Sound requires a medium to travel through"
            ]
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
            videoId: "FkTYVIKtxFk",
            worksheetProblems: [
              { id: 1, problem: "An atom has 6 protons. What element is it?", type: "text" },
              { id: 2, problem: "If an atom has 11 protons and 12 neutrons, what is its mass number?", type: "text" },
              { id: 3, problem: "How many electrons does a neutral oxygen atom have?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "The nucleus of an atom contains:",
                options: ["Protons and electrons", "Protons and neutrons", "Neutrons and electrons", "Only protons"],
                correct: "Protons and neutrons"
              },
              {
                id: 2,
                question: "The atomic number represents the number of:",
                options: ["Neutrons", "Electrons", "Protons", "Protons + Neutrons"],
                correct: "Protons"
              },
              {
                id: 3,
                question: "Which particle has a negative charge?",
                options: ["Proton", "Neutron", "Electron", "Nucleus"],
                correct: "Electron"
              }
            ],
            keyTakeaways: [
              "Atoms consist of protons, neutrons, and electrons",
              "The atomic number defines the element",
              "Electrons orbit the nucleus in energy levels"
            ]
          },
          {
            id: "periodic-table",
            title: "The Periodic Table",
            videoId: "rz4Dd1I_fX0",
            worksheetProblems: [
              { id: 1, problem: "Name three elements in Group 1 (alkali metals)", type: "text" },
              { id: 2, problem: "What is the symbol for Gold?", type: "text" },
              { id: 3, problem: "Which group contains the noble gases?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "Elements in the same group have similar:",
                options: ["Atomic mass", "Chemical properties", "Number of neutrons", "Color"],
                correct: "Chemical properties"
              },
              {
                id: 2,
                question: "How many elements are in a period?",
                options: ["Always 8", "Always 18", "Varies by period", "Always 2"],
                correct: "Varies by period"
              },
              {
                id: 3,
                question: "Metals are generally found on the ____ of the periodic table:",
                options: ["Right side", "Left side", "Top", "Center only"],
                correct: "Left side"
              }
            ],
            keyTakeaways: [
              "The periodic table organizes elements by atomic number",
              "Groups (columns) share similar properties",
              "Periods (rows) show trends in properties"
            ]
          },
          {
            id: "chemical-reactions",
            title: "Chemical Reactions",
            videoId: "3BYviRZ63lI",
            worksheetProblems: [
              { id: 1, problem: "Balance: H₂ + O₂ → H₂O", type: "text" },
              { id: 2, problem: "Is rusting of iron a physical or chemical change?", type: "text" },
              { id: 3, problem: "Balance: Na + Cl₂ → NaCl", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "In a chemical reaction, substances that react are called:",
                options: ["Products", "Reactants", "Catalysts", "Solutions"],
                correct: "Reactants"
              },
              {
                id: 2,
                question: "A balanced chemical equation has equal numbers of:",
                options: ["Molecules", "Atoms of each element", "Products", "Reactants"],
                correct: "Atoms of each element"
              },
              {
                id: 3,
                question: "Which is evidence of a chemical reaction?",
                options: ["Change in size", "Color change", "Change in shape", "Change in position"],
                correct: "Color change"
              }
            ],
            keyTakeaways: [
              "Chemical reactions form new substances",
              "Mass is conserved in chemical reactions",
              "Equations must be balanced"
            ]
          },
          {
            id: "acids-bases",
            title: "Acids and Bases",
            videoId: "IqsZJO6BqlA",
            worksheetProblems: [
              { id: 1, problem: "What is the pH of a neutral solution?", type: "text" },
              { id: 2, problem: "Is lemon juice acidic or basic?", type: "text" },
              { id: 3, problem: "What happens when an acid reacts with a base?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "The pH scale ranges from:",
                options: ["0 to 10", "0 to 14", "1 to 10", "1 to 14"],
                correct: "0 to 14"
              },
              {
                id: 2,
                question: "Acids have a pH:",
                options: ["Greater than 7", "Equal to 7", "Less than 7", "Always 0"],
                correct: "Less than 7"
              },
              {
                id: 3,
                question: "When an acid and base react, they produce:",
                options: ["More acid", "More base", "Salt and water", "Only water"],
                correct: "Salt and water"
              }
            ],
            keyTakeaways: [
              "pH measures how acidic or basic a solution is",
              "Acids have pH < 7, bases have pH > 7",
              "Neutralization produces salt and water"
            ]
          }
        ]
      },
      {
        id: "biology",
        name: "Biology",
        lessons: [
          {
            id: "cells",
            title: "Cell Structure and Function",
            videoId: "URUJD5NEXC8",
            worksheetProblems: [
              { id: 1, problem: "Name three organelles found in plant cells but not animal cells", type: "text" },
              { id: 2, problem: "What is the function of mitochondria?", type: "text" },
              { id: 3, problem: "Which organelle controls cell activities?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "The basic unit of life is the:",
                options: ["Organ", "Tissue", "Cell", "Molecule"],
                correct: "Cell"
              },
              {
                id: 2,
                question: "Which organelle is known as the powerhouse of the cell?",
                options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
                correct: "Mitochondria"
              },
              {
                id: 3,
                question: "Plant cells have ____ that animal cells don't:",
                options: ["Mitochondria", "Cell walls", "Ribosomes", "Cytoplasm"],
                correct: "Cell walls"
              }
            ],
            keyTakeaways: [
              "Cells are the building blocks of all living things",
              "Different organelles have specific functions",
              "Plant and animal cells have some differences"
            ]
          },
          {
            id: "genetics",
            title: "Genetics and Heredity",
            videoId: "CBezq1fFUEA",
            worksheetProblems: [
              { id: 1, problem: "If both parents are Aa, what percentage of offspring will be aa?", type: "text" },
              { id: 2, problem: "What does DNA stand for?", type: "text" },
              { id: 3, problem: "How many chromosomes do humans have?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "Genes are segments of:",
                options: ["Protein", "DNA", "RNA", "Cells"],
                correct: "DNA"
              },
              {
                id: 2,
                question: "Which scientist is famous for pea plant experiments on heredity?",
                options: ["Darwin", "Mendel", "Watson", "Crick"],
                correct: "Mendel"
              },
              {
                id: 3,
                question: "A dominant trait is represented by:",
                options: ["Lowercase letter", "Uppercase letter", "Number", "Symbol"],
                correct: "Uppercase letter"
              }
            ],
            keyTakeaways: [
              "DNA carries genetic information",
              "Traits are inherited from parents",
              "Dominant and recessive alleles determine traits"
            ]
          },
          {
            id: "evolution",
            title: "Evolution and Natural Selection",
            videoId: "hOfRN0KihOU",
            worksheetProblems: [
              { id: 1, problem: "Define natural selection in your own words", type: "text" },
              { id: 2, problem: "Give an example of an adaptation", type: "text" },
              { id: 3, problem: "What is a fossil?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "Natural selection was proposed by:",
                options: ["Mendel", "Darwin", "Watson", "Lamarck"],
                correct: "Darwin"
              },
              {
                id: 2,
                question: "Organisms better adapted to their environment are more likely to:",
                options: ["Die out", "Survive and reproduce", "Stay the same", "Migrate"],
                correct: "Survive and reproduce"
              },
              {
                id: 3,
                question: "Evolution is change in a population over:",
                options: ["Days", "Weeks", "Years", "Many generations"],
                correct: "Many generations"
              }
            ],
            keyTakeaways: [
              "Evolution explains how species change over time",
              "Natural selection favors beneficial traits",
              "Evidence includes fossils, DNA, and anatomical similarities"
            ]
          },
          {
            id: "ecology",
            title: "Ecology and Ecosystems",
            videoId: "MOSXMW_GvkE",
            worksheetProblems: [
              { id: 1, problem: "What is the difference between a food chain and a food web?", type: "text" },
              { id: 2, problem: "Name three abiotic factors in an ecosystem", type: "text" },
              { id: 3, problem: "What is a producer in an ecosystem?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "Organisms that make their own food are called:",
                options: ["Consumers", "Producers", "Decomposers", "Herbivores"],
                correct: "Producers"
              },
              {
                id: 2,
                question: "The role an organism plays in its environment is its:",
                options: ["Habitat", "Niche", "Population", "Community"],
                correct: "Niche"
              },
              {
                id: 3,
                question: "Energy in an ecosystem flows from:",
                options: ["Consumers to producers", "Sun to producers to consumers", "Decomposers to producers", "Consumers to sun"],
                correct: "Sun to producers to consumers"
              }
            ],
            keyTakeaways: [
              "Ecosystems include all living and nonliving components",
              "Energy flows through food chains and webs",
              "Every organism has a role in its ecosystem"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "language",
    name: "Language Arts",
    icon: "📝",
    chapters: [
      {
        id: "grammar",
        name: "Grammar",
        lessons: [
          {
            id: "parts-of-speech",
            title: "Parts of Speech",
            videoId: "zIxAejTUlDE",
            worksheetProblems: [
              { id: 1, problem: "Identify the noun in: The cat ran quickly", type: "text" },
              { id: 2, problem: "What is the verb in: She sings beautifully", type: "text" },
              { id: 3, problem: "Find the adjective in: The blue car stopped suddenly", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "A noun is a:",
                options: ["Action word", "Describing word", "Person, place, or thing", "Connecting word"],
                correct: "Person, place, or thing"
              },
              {
                id: 2,
                question: "Which word is a verb?",
                options: ["Happy", "Running", "Beautiful", "Quickly"],
                correct: "Running"
              },
              {
                id: 3,
                question: "An adjective describes a:",
                options: ["Verb", "Noun", "Adverb", "Preposition"],
                correct: "Noun"
              }
            ],
            keyTakeaways: [
              "Parts of speech are the building blocks of sentences",
              "Each part has a specific function",
              "Understanding parts of speech improves writing"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "social",
    name: "Social Studies",
    icon: "📚",
    chapters: [
      {
        id: "history",
        name: "History",
        lessons: [
          {
            id: "ancient-civilizations",
            title: "Ancient Civilizations",
            videoId: "WNKim2RRLj0",
            worksheetProblems: [
              { id: 1, problem: "Name three ancient civilizations and their main contributions", type: "text" },
              { id: 2, problem: "Where was ancient Mesopotamia located?", type: "text" },
              { id: 3, problem: "What were Egyptian pyramids used for?", type: "text" }
            ],
            quizQuestions: [
              {
                id: 1,
                question: "Which civilization built the pyramids?",
                options: ["Romans", "Greeks", "Egyptians", "Mesopotamians"],
                correct: "Egyptians"
              },
              {
                id: 2,
                question: "Mesopotamia is known as the:",
                options: ["Land of pharaohs", "Cradle of civilization", "Ancient empire", "Desert kingdom"],
                correct: "Cradle of civilization"
              },
              {
                id: 3,
                question: "Ancient civilizations developed near:",
                options: ["Mountains", "Rivers", "Deserts", "Forests"],
                correct: "Rivers"
              }
            ],
            keyTakeaways: [
              "Ancient civilizations laid foundations for modern society",
              "Geography influenced civilization development",
              "Each civilization made unique contributions"
            ]
          }
        ]
      }
    ]
  }
];

export function findLesson(subjectId: string, chapterId: string, lessonId: string): Lesson | null {
  const subject = lessonData.find(s => s.id === subjectId);
  if (!subject) return null;
  
  const chapter = subject.chapters.find(c => c.id === chapterId);
  if (!chapter) return null;
  
  return chapter.lessons.find(l => l.id === lessonId) || null;
}

export function getSubjectData(subjectId: string): Subject | null {
  return lessonData.find(s => s.id === subjectId) || null;
}
