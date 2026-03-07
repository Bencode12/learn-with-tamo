// Assessment question banks for all Program Learning subjects

export interface AssessmentQuestion {
  id: string;
  field: string;
  question: string;
  options: string[];
  correct: string;
  difficulty: "easy" | "medium" | "hard";
}

// ─── MATHEMATICS ───────────────────────────────────────────
export const mathAssessment: AssessmentQuestion[] = [
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

// ─── SCIENCE ───────────────────────────────────────────────
export const scienceAssessment: AssessmentQuestion[] = [
  // Classical Mechanics
  { id: "mech1", field: "physics_mechanics", question: "F = ma is known as Newton's ___ Law", options: ["Second", "First", "Third", "Fourth"], correct: "Second", difficulty: "easy" },
  { id: "mech2", field: "physics_mechanics", question: "What is the unit of force in SI?", options: ["Newton", "Joule", "Watt", "Pascal"], correct: "Newton", difficulty: "easy" },
  { id: "mech3", field: "physics_mechanics", question: "A 5kg object accelerates at 3 m/s². What force is applied?", options: ["15 N", "8 N", "1.67 N", "2 N"], correct: "15 N", difficulty: "easy" },
  { id: "mech4", field: "physics_mechanics", question: "Kinetic energy formula is?", options: ["½mv²", "mgh", "mv", "½mv"], correct: "½mv²", difficulty: "easy" },
  // Electromagnetism
  { id: "em1", field: "physics_em", question: "What is the charge of an electron?", options: ["-1.6×10⁻¹⁹ C", "1.6×10⁻¹⁹ C", "-1 C", "0 C"], correct: "-1.6×10⁻¹⁹ C", difficulty: "easy" },
  { id: "em2", field: "physics_em", question: "Ohm's Law states V = ?", options: ["IR", "I/R", "R/I", "I²R"], correct: "IR", difficulty: "easy" },
  { id: "em3", field: "physics_em", question: "The unit of magnetic field strength is?", options: ["Tesla", "Ampere", "Volt", "Ohm"], correct: "Tesla", difficulty: "easy" },
  { id: "em4", field: "physics_em", question: "Coulomb's law describes force between?", options: ["Charges", "Masses", "Magnets", "Currents"], correct: "Charges", difficulty: "easy" },
  // Quantum Mechanics
  { id: "qm1", field: "physics_quantum", question: "Planck's constant h ≈ ?", options: ["6.63×10⁻³⁴ J·s", "3×10⁸ m/s", "1.6×10⁻¹⁹ C", "9.8 m/s²"], correct: "6.63×10⁻³⁴ J·s", difficulty: "medium" },
  { id: "qm2", field: "physics_quantum", question: "The Heisenberg Uncertainty Principle limits simultaneous knowledge of?", options: ["Position and momentum", "Mass and velocity", "Time and energy only", "Charge and spin"], correct: "Position and momentum", difficulty: "medium" },
  { id: "qm3", field: "physics_quantum", question: "What does the wavefunction ψ describe?", options: ["Probability amplitude", "Exact position", "Exact velocity", "Force"], correct: "Probability amplitude", difficulty: "medium" },
  { id: "qm4", field: "physics_quantum", question: "The photoelectric effect demonstrates light's?", options: ["Particle nature", "Wave nature", "Magnetic properties", "Thermal properties"], correct: "Particle nature", difficulty: "medium" },
  // Thermodynamics
  { id: "thermo1", field: "physics_thermo", question: "The first law of thermodynamics is about?", options: ["Conservation of energy", "Entropy increase", "Absolute zero", "Heat engines"], correct: "Conservation of energy", difficulty: "easy" },
  { id: "thermo2", field: "physics_thermo", question: "Absolute zero is approximately?", options: ["-273.15°C", "-100°C", "0°C", "-460°C"], correct: "-273.15°C", difficulty: "easy" },
  { id: "thermo3", field: "physics_thermo", question: "Entropy in an isolated system always?", options: ["Increases or stays same", "Decreases", "Stays constant", "Oscillates"], correct: "Increases or stays same", difficulty: "medium" },
  { id: "thermo4", field: "physics_thermo", question: "Which process occurs at constant temperature?", options: ["Isothermal", "Adiabatic", "Isobaric", "Isochoric"], correct: "Isothermal", difficulty: "easy" },
  // Organic Chemistry
  { id: "ochem1", field: "chemistry_organic", question: "What is the simplest alkane?", options: ["Methane", "Ethane", "Propane", "Butane"], correct: "Methane", difficulty: "easy" },
  { id: "ochem2", field: "chemistry_organic", question: "What functional group defines an alcohol?", options: ["-OH", "-COOH", "-NH₂", "-CHO"], correct: "-OH", difficulty: "easy" },
  { id: "ochem3", field: "chemistry_organic", question: "Benzene has how many carbon atoms?", options: ["6", "5", "8", "4"], correct: "6", difficulty: "easy" },
  { id: "ochem4", field: "chemistry_organic", question: "An ester is formed from an acid and?", options: ["Alcohol", "Amine", "Aldehyde", "Ketone"], correct: "Alcohol", difficulty: "medium" },
  // Inorganic Chemistry
  { id: "ichem1", field: "chemistry_inorganic", question: "What is the atomic number of Carbon?", options: ["6", "12", "8", "14"], correct: "6", difficulty: "easy" },
  { id: "ichem2", field: "chemistry_inorganic", question: "How many electrons in a filled d-orbital?", options: ["10", "6", "8", "14"], correct: "10", difficulty: "medium" },
  { id: "ichem3", field: "chemistry_inorganic", question: "Which element has the highest electronegativity?", options: ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"], correct: "Fluorine", difficulty: "easy" },
  { id: "ichem4", field: "chemistry_inorganic", question: "Noble gases are in Group?", options: ["18", "1", "17", "8"], correct: "18", difficulty: "easy" },
  // Physical Chemistry
  { id: "pchem1", field: "chemistry_physical", question: "PV = nRT is the?", options: ["Ideal gas law", "Boyle's law", "Charles's law", "Avogadro's law"], correct: "Ideal gas law", difficulty: "easy" },
  { id: "pchem2", field: "chemistry_physical", question: "What does a catalyst do?", options: ["Lowers activation energy", "Increases energy", "Changes equilibrium", "Adds reactants"], correct: "Lowers activation energy", difficulty: "easy" },
  { id: "pchem3", field: "chemistry_physical", question: "Avogadro's number is approximately?", options: ["6.02×10²³", "3.14×10²³", "6.02×10²⁰", "1.6×10²³"], correct: "6.02×10²³", difficulty: "easy" },
  { id: "pchem4", field: "chemistry_physical", question: "ΔG < 0 means a reaction is?", options: ["Spontaneous", "Non-spontaneous", "At equilibrium", "Impossible"], correct: "Spontaneous", difficulty: "medium" },
  // Cell Biology
  { id: "cell1", field: "biology_cell", question: "The powerhouse of the cell is the?", options: ["Mitochondria", "Nucleus", "Ribosome", "Golgi apparatus"], correct: "Mitochondria", difficulty: "easy" },
  { id: "cell2", field: "biology_cell", question: "DNA replication occurs in which phase?", options: ["S phase", "G1 phase", "M phase", "G2 phase"], correct: "S phase", difficulty: "medium" },
  { id: "cell3", field: "biology_cell", question: "Which organelle is involved in protein synthesis?", options: ["Ribosome", "Lysosome", "Vacuole", "Centriole"], correct: "Ribosome", difficulty: "easy" },
  { id: "cell4", field: "biology_cell", question: "Plant cells have ___ that animal cells don't", options: ["Cell wall", "Nucleus", "Mitochondria", "Ribosomes"], correct: "Cell wall", difficulty: "easy" },
  // Genetics
  { id: "gen1", field: "biology_genetics", question: "How many base pairs are in the human genome (approximately)?", options: ["3 billion", "1 million", "100 million", "10 billion"], correct: "3 billion", difficulty: "medium" },
  { id: "gen2", field: "biology_genetics", question: "Which base pairs with Adenine in DNA?", options: ["Thymine", "Cytosine", "Guanine", "Uracil"], correct: "Thymine", difficulty: "easy" },
  { id: "gen3", field: "biology_genetics", question: "A dominant allele is expressed when?", options: ["One or two copies present", "Only two copies", "Never alone", "Only with recessive"], correct: "One or two copies present", difficulty: "easy" },
  { id: "gen4", field: "biology_genetics", question: "Humans have ___ pairs of chromosomes", options: ["23", "46", "22", "24"], correct: "23", difficulty: "easy" },
  // Ecology
  { id: "eco1", field: "biology_ecology", question: "Primary producers in most ecosystems are?", options: ["Plants", "Herbivores", "Decomposers", "Carnivores"], correct: "Plants", difficulty: "easy" },
  { id: "eco2", field: "biology_ecology", question: "The study of interactions between organisms and their environment is?", options: ["Ecology", "Genetics", "Anatomy", "Taxonomy"], correct: "Ecology", difficulty: "easy" },
  { id: "eco3", field: "biology_ecology", question: "What is biodiversity?", options: ["Variety of life in an area", "Number of plants", "Size of habitat", "Age of ecosystem"], correct: "Variety of life in an area", difficulty: "easy" },
  { id: "eco4", field: "biology_ecology", question: "The carbon cycle includes?", options: ["Photosynthesis and respiration", "Only respiration", "Only photosynthesis", "Nitrogen fixation"], correct: "Photosynthesis and respiration", difficulty: "medium" },
];

// ─── HISTORY ───────────────────────────────────────────────
export const historyAssessment: AssessmentQuestion[] = [
  // Ancient History
  { id: "anc1", field: "ancient_history", question: "The Great Pyramid of Giza was built for which pharaoh?", options: ["Khufu", "Tutankhamun", "Ramses II", "Cleopatra"], correct: "Khufu", difficulty: "easy" },
  { id: "anc2", field: "ancient_history", question: "Democracy originated in which ancient city?", options: ["Athens", "Rome", "Sparta", "Babylon"], correct: "Athens", difficulty: "easy" },
  { id: "anc3", field: "ancient_history", question: "The Roman Republic fell and became an Empire under?", options: ["Augustus", "Julius Caesar", "Nero", "Marcus Aurelius"], correct: "Augustus", difficulty: "medium" },
  { id: "anc4", field: "ancient_history", question: "The Rosetta Stone helped decipher which script?", options: ["Egyptian hieroglyphs", "Cuneiform", "Linear B", "Sanskrit"], correct: "Egyptian hieroglyphs", difficulty: "easy" },
  // Medieval History
  { id: "med1", field: "medieval_history", question: "The Magna Carta was signed in which year?", options: ["1215", "1066", "1492", "1348"], correct: "1215", difficulty: "medium" },
  { id: "med2", field: "medieval_history", question: "The Black Death peaked in Europe around?", options: ["1348", "1215", "1066", "1453"], correct: "1348", difficulty: "medium" },
  { id: "med3", field: "medieval_history", question: "Feudalism was primarily a system of?", options: ["Land ownership and loyalty", "Trade routes", "Religious law", "Democracy"], correct: "Land ownership and loyalty", difficulty: "easy" },
  { id: "med4", field: "medieval_history", question: "The Crusades were primarily fought to control?", options: ["The Holy Land", "Trade routes", "Spain", "Constantinople"], correct: "The Holy Land", difficulty: "easy" },
  // Modern History
  { id: "mod1", field: "modern_history", question: "The Industrial Revolution began in which country?", options: ["Britain", "France", "Germany", "United States"], correct: "Britain", difficulty: "easy" },
  { id: "mod2", field: "modern_history", question: "The French Revolution began in which year?", options: ["1789", "1776", "1804", "1815"], correct: "1789", difficulty: "easy" },
  { id: "mod3", field: "modern_history", question: "The Berlin Wall fell in?", options: ["1989", "1991", "1985", "1979"], correct: "1989", difficulty: "easy" },
  { id: "mod4", field: "modern_history", question: "The Cold War was primarily between?", options: ["USA and USSR", "USA and China", "UK and Germany", "France and Russia"], correct: "USA and USSR", difficulty: "easy" },
  // World Wars
  { id: "ww1", field: "world_wars", question: "WWI started with the assassination of?", options: ["Archduke Franz Ferdinand", "Kaiser Wilhelm", "Tsar Nicholas II", "King George V"], correct: "Archduke Franz Ferdinand", difficulty: "easy" },
  { id: "ww2", field: "world_wars", question: "D-Day occurred on which date?", options: ["June 6, 1944", "May 8, 1945", "December 7, 1941", "September 1, 1939"], correct: "June 6, 1944", difficulty: "medium" },
  { id: "ww3", field: "world_wars", question: "The Treaty of Versailles ended which war?", options: ["World War I", "World War II", "Korean War", "Franco-Prussian War"], correct: "World War I", difficulty: "easy" },
  { id: "ww4", field: "world_wars", question: "The atomic bombs were dropped on?", options: ["Hiroshima and Nagasaki", "Tokyo and Osaka", "Berlin and Munich", "London and Paris"], correct: "Hiroshima and Nagasaki", difficulty: "easy" },
  // American History
  { id: "us1", field: "american_history", question: "The Declaration of Independence was signed in?", options: ["1776", "1789", "1812", "1492"], correct: "1776", difficulty: "easy" },
  { id: "us2", field: "american_history", question: "The Emancipation Proclamation was issued by?", options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "Andrew Jackson"], correct: "Abraham Lincoln", difficulty: "easy" },
  { id: "us3", field: "american_history", question: "The Louisiana Purchase doubled the size of the US and was bought from?", options: ["France", "Spain", "Britain", "Mexico"], correct: "France", difficulty: "easy" },
  { id: "us4", field: "american_history", question: "The Civil Rights Act of 1964 was signed by?", options: ["Lyndon B. Johnson", "John F. Kennedy", "Dwight Eisenhower", "Richard Nixon"], correct: "Lyndon B. Johnson", difficulty: "medium" },
  // European History
  { id: "eu1", field: "european_history", question: "The Renaissance began in which country?", options: ["Italy", "France", "England", "Germany"], correct: "Italy", difficulty: "easy" },
  { id: "eu2", field: "european_history", question: "Napoleon was exiled to which island first?", options: ["Elba", "St. Helena", "Corsica", "Sicily"], correct: "Elba", difficulty: "medium" },
  { id: "eu3", field: "european_history", question: "The Protestant Reformation was started by?", options: ["Martin Luther", "John Calvin", "Henry VIII", "Erasmus"], correct: "Martin Luther", difficulty: "easy" },
  { id: "eu4", field: "european_history", question: "The European Union was founded (as EEC) by the Treaty of?", options: ["Rome", "Versailles", "Paris", "Maastricht"], correct: "Rome", difficulty: "medium" },
  // Asian History
  { id: "asia1", field: "asian_history", question: "The Great Wall of China was primarily built to defend against?", options: ["Mongol invasions", "Japanese attacks", "Indian expansion", "Korean raids"], correct: "Mongol invasions", difficulty: "easy" },
  { id: "asia2", field: "asian_history", question: "The Meiji Restoration occurred in which country?", options: ["Japan", "China", "Korea", "Thailand"], correct: "Japan", difficulty: "easy" },
  { id: "asia3", field: "asian_history", question: "The Silk Road connected?", options: ["China to the Mediterranean", "India to Africa", "Japan to Europe", "Korea to Arabia"], correct: "China to the Mediterranean", difficulty: "easy" },
  { id: "asia4", field: "asian_history", question: "Genghis Khan founded which empire?", options: ["Mongol Empire", "Ottoman Empire", "Mughal Empire", "Persian Empire"], correct: "Mongol Empire", difficulty: "easy" },
  // Art History
  { id: "arth1", field: "art_history", question: "Who painted the Mona Lisa?", options: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"], correct: "Leonardo da Vinci", difficulty: "easy" },
  { id: "arth2", field: "art_history", question: "The Impressionist movement began in?", options: ["France", "Italy", "Spain", "Netherlands"], correct: "France", difficulty: "easy" },
  { id: "arth3", field: "art_history", question: "Picasso is associated with which art movement?", options: ["Cubism", "Impressionism", "Surrealism", "Realism"], correct: "Cubism", difficulty: "easy" },
  { id: "arth4", field: "art_history", question: "'Starry Night' was painted by?", options: ["Van Gogh", "Monet", "Renoir", "Cézanne"], correct: "Van Gogh", difficulty: "easy" },
];

// ─── PROGRAMMING ───────────────────────────────────────────
export const codingAssessment: AssessmentQuestion[] = [
  // Python
  { id: "py1", field: "python", question: "What does 'len([1,2,3])' return in Python?", options: ["3", "2", "[1,2,3]", "Error"], correct: "3", difficulty: "easy" },
  { id: "py2", field: "python", question: "Which keyword defines a function in Python?", options: ["def", "function", "func", "fn"], correct: "def", difficulty: "easy" },
  { id: "py3", field: "python", question: "What is a list comprehension?", options: ["A concise way to create lists", "A type of loop", "A data class", "A module"], correct: "A concise way to create lists", difficulty: "easy" },
  { id: "py4", field: "python", question: "What does 'pip' do?", options: ["Installs packages", "Runs scripts", "Compiles code", "Debugs programs"], correct: "Installs packages", difficulty: "easy" },
  // JavaScript
  { id: "js1", field: "javascript", question: "What does '===' check in JavaScript?", options: ["Value and type equality", "Value equality only", "Reference equality", "Type only"], correct: "Value and type equality", difficulty: "easy" },
  { id: "js2", field: "javascript", question: "What is a closure?", options: ["Function with access to outer scope", "A type of loop", "An error handler", "A class method"], correct: "Function with access to outer scope", difficulty: "medium" },
  { id: "js3", field: "javascript", question: "'const' in JavaScript means?", options: ["Block-scoped, can't reassign", "Global variable", "Mutable reference", "Class constant"], correct: "Block-scoped, can't reassign", difficulty: "easy" },
  { id: "js4", field: "javascript", question: "What is the output of typeof null?", options: ["'object'", "'null'", "'undefined'", "'boolean'"], correct: "'object'", difficulty: "medium" },
  // TypeScript
  { id: "ts1", field: "typescript", question: "TypeScript adds ___ to JavaScript", options: ["Static typing", "Runtime speed", "New syntax only", "Server capabilities"], correct: "Static typing", difficulty: "easy" },
  { id: "ts2", field: "typescript", question: "What is an interface in TypeScript?", options: ["A type contract for objects", "A class instance", "A runtime check", "A module"], correct: "A type contract for objects", difficulty: "easy" },
  { id: "ts3", field: "typescript", question: "What does 'string | number' represent?", options: ["Union type", "Intersection type", "Generic type", "Array type"], correct: "Union type", difficulty: "easy" },
  { id: "ts4", field: "typescript", question: "What is 'any' type used for?", options: ["Opting out of type checking", "String values", "Numbers only", "Null values"], correct: "Opting out of type checking", difficulty: "easy" },
  // React
  { id: "react1", field: "react", question: "What hook manages state in functional components?", options: ["useState", "useEffect", "useRef", "useMemo"], correct: "useState", difficulty: "easy" },
  { id: "react2", field: "react", question: "JSX stands for?", options: ["JavaScript XML", "Java Syntax Extension", "JSON Extended", "JavaScript Extra"], correct: "JavaScript XML", difficulty: "easy" },
  { id: "react3", field: "react", question: "What triggers a re-render in React?", options: ["State or props change", "Variable change", "Function call", "Import change"], correct: "State or props change", difficulty: "easy" },
  { id: "react4", field: "react", question: "useEffect with an empty dependency array runs?", options: ["Once on mount", "Every render", "Never", "On unmount only"], correct: "Once on mount", difficulty: "medium" },
  // Algorithms
  { id: "algo1", field: "algorithms", question: "What is the time complexity of binary search?", options: ["O(log n)", "O(n)", "O(n²)", "O(1)"], correct: "O(log n)", difficulty: "easy" },
  { id: "algo2", field: "algorithms", question: "Which sorting algorithm has worst case O(n log n)?", options: ["Merge sort", "Quick sort", "Bubble sort", "Selection sort"], correct: "Merge sort", difficulty: "medium" },
  { id: "algo3", field: "algorithms", question: "BFS uses which data structure?", options: ["Queue", "Stack", "Heap", "Tree"], correct: "Queue", difficulty: "easy" },
  { id: "algo4", field: "algorithms", question: "Dynamic programming solves problems by?", options: ["Breaking into overlapping subproblems", "Random sampling", "Brute force", "Greedy choices only"], correct: "Breaking into overlapping subproblems", difficulty: "medium" },
  // Data Structures
  { id: "ds1", field: "data_structures", question: "A stack follows which principle?", options: ["LIFO", "FIFO", "Random access", "Priority"], correct: "LIFO", difficulty: "easy" },
  { id: "ds2", field: "data_structures", question: "A hash table provides average ___ lookup time", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: "O(1)", difficulty: "easy" },
  { id: "ds3", field: "data_structures", question: "A binary tree node has at most ___ children", options: ["2", "1", "3", "Unlimited"], correct: "2", difficulty: "easy" },
  { id: "ds4", field: "data_structures", question: "A linked list advantage over arrays is?", options: ["O(1) insertion at head", "O(1) random access", "Less memory", "Faster sorting"], correct: "O(1) insertion at head", difficulty: "medium" },
  // Databases
  { id: "db1", field: "databases", question: "SQL stands for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "System Query Language"], correct: "Structured Query Language", difficulty: "easy" },
  { id: "db2", field: "databases", question: "A primary key must be?", options: ["Unique and not null", "Any value", "Always numeric", "Auto-increment only"], correct: "Unique and not null", difficulty: "easy" },
  { id: "db3", field: "databases", question: "NoSQL databases are best for?", options: ["Flexible, unstructured data", "Strict schemas only", "Small datasets", "Single tables"], correct: "Flexible, unstructured data", difficulty: "easy" },
  { id: "db4", field: "databases", question: "An INDEX in SQL is used to?", options: ["Speed up queries", "Store data", "Create tables", "Define constraints"], correct: "Speed up queries", difficulty: "easy" },
  // Web Dev
  { id: "web1", field: "web_dev", question: "HTTP status code 404 means?", options: ["Not Found", "Server Error", "Unauthorized", "OK"], correct: "Not Found", difficulty: "easy" },
  { id: "web2", field: "web_dev", question: "REST API uses which protocol?", options: ["HTTP", "FTP", "SMTP", "SSH"], correct: "HTTP", difficulty: "easy" },
  { id: "web3", field: "web_dev", question: "CSS stands for?", options: ["Cascading Style Sheets", "Computer Style Syntax", "Creative Style System", "Cascading Syntax Sheets"], correct: "Cascading Style Sheets", difficulty: "easy" },
  { id: "web4", field: "web_dev", question: "What does responsive design mean?", options: ["Adapts to different screen sizes", "Loads fast", "Uses animations", "Works offline"], correct: "Adapts to different screen sizes", difficulty: "easy" },
  // Machine Learning
  { id: "ml1", field: "machine_learning", question: "Supervised learning requires?", options: ["Labeled data", "Unlabeled data", "No data", "Only text data"], correct: "Labeled data", difficulty: "easy" },
  { id: "ml2", field: "machine_learning", question: "Overfitting means the model?", options: ["Memorizes training data", "Performs well generally", "Is too simple", "Needs more parameters"], correct: "Memorizes training data", difficulty: "easy" },
  { id: "ml3", field: "machine_learning", question: "A neural network layer transforms input using?", options: ["Weights, bias, and activation", "Random values", "SQL queries", "File operations"], correct: "Weights, bias, and activation", difficulty: "medium" },
  { id: "ml4", field: "machine_learning", question: "K-means is a type of?", options: ["Clustering algorithm", "Classification algorithm", "Regression algorithm", "Reinforcement learning"], correct: "Clustering algorithm", difficulty: "medium" },
];

// ─── LANGUAGES ─────────────────────────────────────────────
export const languagesAssessment: AssessmentQuestion[] = [
  // Spanish
  { id: "es1", field: "spanish", question: "How do you say 'Hello' in Spanish?", options: ["Hola", "Bonjour", "Hallo", "Ciao"], correct: "Hola", difficulty: "easy" },
  { id: "es2", field: "spanish", question: "'Yo soy' means?", options: ["I am", "You are", "He is", "We are"], correct: "I am", difficulty: "easy" },
  { id: "es3", field: "spanish", question: "What is 'library' in Spanish?", options: ["Biblioteca", "Librería", "Escuela", "Casa"], correct: "Biblioteca", difficulty: "medium" },
  { id: "es4", field: "spanish", question: "The past tense of 'hablar' (yo) is?", options: ["Hablé", "Hablo", "Hablaré", "Hablaba"], correct: "Hablé", difficulty: "medium" },
  // French
  { id: "fr1", field: "french", question: "How do you say 'Thank you' in French?", options: ["Merci", "Gracias", "Danke", "Grazie"], correct: "Merci", difficulty: "easy" },
  { id: "fr2", field: "french", question: "'Je suis' means?", options: ["I am", "I have", "I go", "I want"], correct: "I am", difficulty: "easy" },
  { id: "fr3", field: "french", question: "Which is feminine: le or la?", options: ["La", "Le", "Les", "Un"], correct: "La", difficulty: "easy" },
  { id: "fr4", field: "french", question: "'Où est la gare?' means?", options: ["Where is the station?", "What is the price?", "How are you?", "What time is it?"], correct: "Where is the station?", difficulty: "medium" },
  // German
  { id: "de1", field: "german", question: "How do you say 'Good morning' in German?", options: ["Guten Morgen", "Bon matin", "Buenos días", "Good morning"], correct: "Guten Morgen", difficulty: "easy" },
  { id: "de2", field: "german", question: "'Ich bin' means?", options: ["I am", "I have", "I go", "I see"], correct: "I am", difficulty: "easy" },
  { id: "de3", field: "german", question: "German has how many grammatical cases?", options: ["4", "3", "2", "6"], correct: "4", difficulty: "medium" },
  { id: "de4", field: "german", question: "What is 'Schmetterling'?", options: ["Butterfly", "Hammer", "Thunder", "Mountain"], correct: "Butterfly", difficulty: "medium" },
  // Japanese
  { id: "jp1", field: "japanese", question: "How many writing systems does Japanese use?", options: ["3", "1", "2", "4"], correct: "3", difficulty: "easy" },
  { id: "jp2", field: "japanese", question: "'Konnichiwa' means?", options: ["Hello/Good afternoon", "Thank you", "Goodbye", "Sorry"], correct: "Hello/Good afternoon", difficulty: "easy" },
  { id: "jp3", field: "japanese", question: "Hiragana is used for?", options: ["Native Japanese words", "Foreign words", "Chinese characters", "Numbers only"], correct: "Native Japanese words", difficulty: "easy" },
  { id: "jp4", field: "japanese", question: "The Japanese word order is typically?", options: ["SOV (Subject-Object-Verb)", "SVO", "VSO", "OVS"], correct: "SOV (Subject-Object-Verb)", difficulty: "medium" },
  // Chinese
  { id: "cn1", field: "chinese", question: "Mandarin Chinese has how many tones?", options: ["4 (+ neutral)", "2", "6", "8"], correct: "4 (+ neutral)", difficulty: "easy" },
  { id: "cn2", field: "chinese", question: "'Nǐ hǎo' means?", options: ["Hello", "Thank you", "Goodbye", "Sorry"], correct: "Hello", difficulty: "easy" },
  { id: "cn3", field: "chinese", question: "Pinyin is?", options: ["Romanization of Chinese", "A dialect", "A writing style", "A grammar rule"], correct: "Romanization of Chinese", difficulty: "easy" },
  { id: "cn4", field: "chinese", question: "Chinese characters are called?", options: ["Hanzi", "Kanji", "Hiragana", "Hangul"], correct: "Hanzi", difficulty: "easy" },
  // Korean
  { id: "kr1", field: "korean", question: "The Korean alphabet is called?", options: ["Hangul", "Hanzi", "Kanji", "Katakana"], correct: "Hangul", difficulty: "easy" },
  { id: "kr2", field: "korean", question: "'Annyeonghaseyo' means?", options: ["Hello", "Thank you", "Goodbye", "I'm sorry"], correct: "Hello", difficulty: "easy" },
  { id: "kr3", field: "korean", question: "Korean sentence structure follows?", options: ["SOV order", "SVO order", "VSO order", "Free order"], correct: "SOV order", difficulty: "easy" },
  { id: "kr4", field: "korean", question: "Hangul was invented by?", options: ["King Sejong", "Confucius", "Kim Il-sung", "Yi Sun-sin"], correct: "King Sejong", difficulty: "medium" },
  // Italian
  { id: "it1", field: "italian", question: "'Buongiorno' means?", options: ["Good morning", "Good night", "Thank you", "Goodbye"], correct: "Good morning", difficulty: "easy" },
  { id: "it2", field: "italian", question: "How do you say 'I love' in Italian?", options: ["Io amo", "Yo amo", "Je t'aime", "Ich liebe"], correct: "Io amo", difficulty: "easy" },
  { id: "it3", field: "italian", question: "Italian is a ___ language", options: ["Romance", "Germanic", "Slavic", "Celtic"], correct: "Romance", difficulty: "easy" },
  { id: "it4", field: "italian", question: "'Quanto costa?' means?", options: ["How much does it cost?", "Where is it?", "What time is it?", "Who are you?"], correct: "How much does it cost?", difficulty: "easy" },
  // Portuguese
  { id: "pt1", field: "portuguese", question: "'Obrigado' means?", options: ["Thank you", "Hello", "Goodbye", "Please"], correct: "Thank you", difficulty: "easy" },
  { id: "pt2", field: "portuguese", question: "Portuguese is spoken natively in?", options: ["Brazil and Portugal", "Spain and Mexico", "France and Canada", "Italy and Argentina"], correct: "Brazil and Portugal", difficulty: "easy" },
  { id: "pt3", field: "portuguese", question: "'Eu falo' means?", options: ["I speak", "I eat", "I walk", "I see"], correct: "I speak", difficulty: "easy" },
  { id: "pt4", field: "portuguese", question: "Portuguese uses which accent mark unique to it?", options: ["Tilde (~)", "Umlaut (¨)", "Circumflex only", "Cedilla only"], correct: "Tilde (~)", difficulty: "medium" },
];

// ─── MUSIC ─────────────────────────────────────────────────
export const musicAssessment: AssessmentQuestion[] = [
  // Music Theory
  { id: "mt1", field: "music_theory", question: "How many notes are in a chromatic scale?", options: ["12", "7", "8", "5"], correct: "12", difficulty: "easy" },
  { id: "mt2", field: "music_theory", question: "A major scale follows which pattern?", options: ["W-W-H-W-W-W-H", "W-H-W-W-H-W-W", "H-W-W-W-H-W-W", "W-W-W-H-W-W-H"], correct: "W-W-H-W-W-W-H", difficulty: "medium" },
  { id: "mt3", field: "music_theory", question: "What is the interval between C and G?", options: ["Perfect fifth", "Major third", "Minor seventh", "Perfect fourth"], correct: "Perfect fifth", difficulty: "easy" },
  { id: "mt4", field: "music_theory", question: "A time signature of 4/4 means?", options: ["4 beats per measure, quarter note gets 1 beat", "4 measures per song", "4 instruments", "4 sharps"], correct: "4 beats per measure, quarter note gets 1 beat", difficulty: "easy" },
  // Piano
  { id: "piano1", field: "piano", question: "How many keys does a standard piano have?", options: ["88", "76", "61", "52"], correct: "88", difficulty: "easy" },
  { id: "piano2", field: "piano", question: "Middle C is also called?", options: ["C4", "C3", "C5", "C1"], correct: "C4", difficulty: "easy" },
  { id: "piano3", field: "piano", question: "The black keys on a piano play?", options: ["Sharps and flats", "Natural notes only", "Chords only", "Bass notes only"], correct: "Sharps and flats", difficulty: "easy" },
  { id: "piano4", field: "piano", question: "Which hand typically plays melody?", options: ["Right hand", "Left hand", "Both equally", "Neither"], correct: "Right hand", difficulty: "easy" },
  // Guitar
  { id: "guit1", field: "guitar", question: "Standard guitar tuning (low to high) is?", options: ["E-A-D-G-B-E", "E-A-D-G-B-D", "D-A-D-G-B-E", "E-A-E-G-B-E"], correct: "E-A-D-G-B-E", difficulty: "easy" },
  { id: "guit2", field: "guitar", question: "How many strings does a standard guitar have?", options: ["6", "4", "8", "5"], correct: "6", difficulty: "easy" },
  { id: "guit3", field: "guitar", question: "A barre chord requires?", options: ["Pressing all strings with one finger", "Open strings only", "A capo", "Alternate tuning"], correct: "Pressing all strings with one finger", difficulty: "easy" },
  { id: "guit4", field: "guitar", question: "A capo is used to?", options: ["Raise the pitch/key", "Lower the pitch", "Tune the guitar", "Add distortion"], correct: "Raise the pitch/key", difficulty: "easy" },
  // Composition
  { id: "comp1", field: "composition", question: "ABA form is also called?", options: ["Ternary form", "Binary form", "Rondo form", "Through-composed"], correct: "Ternary form", difficulty: "medium" },
  { id: "comp2", field: "composition", question: "A chord progression I-IV-V-I is common in?", options: ["Pop and rock music", "Only jazz", "Only classical", "Electronic music only"], correct: "Pop and rock music", difficulty: "easy" },
  { id: "comp3", field: "composition", question: "Counterpoint is the art of combining?", options: ["Independent melodic lines", "Chords only", "Rhythms only", "Instruments only"], correct: "Independent melodic lines", difficulty: "medium" },
  { id: "comp4", field: "composition", question: "A motif in music is?", options: ["A short recurring musical idea", "A complete song", "A type of instrument", "A recording technique"], correct: "A short recurring musical idea", difficulty: "easy" },
  // Ear Training
  { id: "ear1", field: "ear_training", question: "Relative pitch means?", options: ["Identifying intervals between notes", "Identifying exact notes without reference", "Playing by ear only", "Perfect tuning"], correct: "Identifying intervals between notes", difficulty: "easy" },
  { id: "ear2", field: "ear_training", question: "A minor third sounds?", options: ["Sad or dark", "Bright and happy", "Dissonant", "Empty"], correct: "Sad or dark", difficulty: "easy" },
  { id: "ear3", field: "ear_training", question: "Perfect pitch (absolute pitch) is?", options: ["Ability to identify any note without reference", "Ability to sing in tune", "Ability to read music", "Ability to play fast"], correct: "Ability to identify any note without reference", difficulty: "easy" },
  { id: "ear4", field: "ear_training", question: "An octave is an interval of?", options: ["12 semitones", "7 semitones", "5 semitones", "8 semitones"], correct: "12 semitones", difficulty: "easy" },
  // Music Production
  { id: "prod1", field: "music_production", question: "A DAW stands for?", options: ["Digital Audio Workstation", "Digital Analog Waveform", "Dynamic Audio Writer", "Data Audio Widget"], correct: "Digital Audio Workstation", difficulty: "easy" },
  { id: "prod2", field: "music_production", question: "EQ is used to?", options: ["Adjust frequency balance", "Add reverb", "Change tempo", "Record audio"], correct: "Adjust frequency balance", difficulty: "easy" },
  { id: "prod3", field: "music_production", question: "Compression in audio reduces?", options: ["Dynamic range", "Frequency range", "Stereo width", "Sample rate"], correct: "Dynamic range", difficulty: "medium" },
  { id: "prod4", field: "music_production", question: "MIDI stands for?", options: ["Musical Instrument Digital Interface", "Music Input Digital Instrument", "Multi-channel Instrument Data Interface", "Musical Interface Data Input"], correct: "Musical Instrument Digital Interface", difficulty: "easy" },
];

// ─── ART & DESIGN ──────────────────────────────────────────
export const artAssessment: AssessmentQuestion[] = [
  // Drawing
  { id: "draw1", field: "drawing", question: "What is the vanishing point in perspective drawing?", options: ["Where parallel lines converge", "The center of the canvas", "The darkest point", "The horizon only"], correct: "Where parallel lines converge", difficulty: "easy" },
  { id: "draw2", field: "drawing", question: "Hatching is a technique using?", options: ["Parallel lines for shading", "Dots for texture", "Smudging", "Color blending"], correct: "Parallel lines for shading", difficulty: "easy" },
  { id: "draw3", field: "drawing", question: "Gesture drawing focuses on?", options: ["Capturing movement and form quickly", "Perfect proportions", "Color accuracy", "Fine details"], correct: "Capturing movement and form quickly", difficulty: "easy" },
  { id: "draw4", field: "drawing", question: "The 'rule of thirds' divides the canvas into?", options: ["9 equal parts", "4 equal parts", "3 equal parts", "6 equal parts"], correct: "9 equal parts", difficulty: "easy" },
  // Painting
  { id: "paint1", field: "painting", question: "Primary colors in paint (subtractive) are?", options: ["Red, blue, yellow", "Red, green, blue", "Cyan, magenta, yellow", "Orange, purple, green"], correct: "Red, blue, yellow", difficulty: "easy" },
  { id: "paint2", field: "painting", question: "Impasto is a technique where paint is?", options: ["Applied thickly for texture", "Diluted with water", "Sprayed on", "Applied in thin layers"], correct: "Applied thickly for texture", difficulty: "medium" },
  { id: "paint3", field: "painting", question: "Watercolor is known for its?", options: ["Transparency", "Opacity", "Thick texture", "Quick drying"], correct: "Transparency", difficulty: "easy" },
  { id: "paint4", field: "painting", question: "Complementary colors are?", options: ["Opposite on the color wheel", "Next to each other", "Same hue, different value", "Primary colors only"], correct: "Opposite on the color wheel", difficulty: "easy" },
  // Digital Art
  { id: "digi1", field: "digital_art", question: "DPI stands for?", options: ["Dots Per Inch", "Digital Pixel Index", "Data Per Image", "Display Pixel Interface"], correct: "Dots Per Inch", difficulty: "easy" },
  { id: "digi2", field: "digital_art", question: "Raster images are made of?", options: ["Pixels", "Vectors", "Paths", "Nodes"], correct: "Pixels", difficulty: "easy" },
  { id: "digi3", field: "digital_art", question: "Which format supports transparency?", options: ["PNG", "JPEG", "BMP", "TIFF"], correct: "PNG", difficulty: "easy" },
  { id: "digi4", field: "digital_art", question: "A layer mask in Photoshop is used to?", options: ["Hide/reveal parts of a layer non-destructively", "Delete pixels", "Add color", "Resize the canvas"], correct: "Hide/reveal parts of a layer non-destructively", difficulty: "medium" },
  // Graphic Design
  { id: "gd1", field: "graphic_design", question: "Kerning refers to?", options: ["Space between individual letter pairs", "Space between lines", "Font size", "Font weight"], correct: "Space between individual letter pairs", difficulty: "easy" },
  { id: "gd2", field: "graphic_design", question: "CMYK is used for?", options: ["Print design", "Screen display", "Web design", "Video editing"], correct: "Print design", difficulty: "easy" },
  { id: "gd3", field: "graphic_design", question: "Leading refers to?", options: ["Line spacing", "Letter spacing", "Word spacing", "Paragraph spacing"], correct: "Line spacing", difficulty: "medium" },
  { id: "gd4", field: "graphic_design", question: "A vector graphic can be scaled?", options: ["Infinitely without quality loss", "Only to 200%", "Only smaller", "With some pixelation"], correct: "Infinitely without quality loss", difficulty: "easy" },
  // UI/UX
  { id: "ux1", field: "ui_ux", question: "UX stands for?", options: ["User Experience", "User Extension", "Universal Exchange", "Unified Experience"], correct: "User Experience", difficulty: "easy" },
  { id: "ux2", field: "ui_ux", question: "A wireframe is?", options: ["A low-fidelity layout sketch", "A final design", "A coded prototype", "A color palette"], correct: "A low-fidelity layout sketch", difficulty: "easy" },
  { id: "ux3", field: "ui_ux", question: "Fitts's Law relates to?", options: ["Time to reach a target based on size and distance", "Color theory", "Typography rules", "Grid systems"], correct: "Time to reach a target based on size and distance", difficulty: "medium" },
  { id: "ux4", field: "ui_ux", question: "A/B testing compares?", options: ["Two versions to see which performs better", "Colors only", "Fonts only", "Load speeds"], correct: "Two versions to see which performs better", difficulty: "easy" },
  // 3D Modeling
  { id: "3d1", field: "3d_modeling", question: "A polygon mesh is made of?", options: ["Vertices, edges, and faces", "Pixels only", "Curves only", "Text layers"], correct: "Vertices, edges, and faces", difficulty: "easy" },
  { id: "3d2", field: "3d_modeling", question: "UV mapping is used to?", options: ["Apply 2D textures to 3D surfaces", "Create animations", "Add lighting", "Export models"], correct: "Apply 2D textures to 3D surfaces", difficulty: "medium" },
  { id: "3d3", field: "3d_modeling", question: "Rendering is the process of?", options: ["Generating a final image from 3D data", "Modeling objects", "Sculpting", "Texturing"], correct: "Generating a final image from 3D data", difficulty: "easy" },
  { id: "3d4", field: "3d_modeling", question: "Blender is?", options: ["Free, open-source 3D software", "A paid Adobe product", "A 2D painting tool", "A video editor only"], correct: "Free, open-source 3D software", difficulty: "easy" },
];

// ─── ASSESSMENT GENERATOR ──────────────────────────────────
const assessmentBanks: Record<string, AssessmentQuestion[]> = {
  math: mathAssessment,
  science: scienceAssessment,
  history: historyAssessment,
  coding: codingAssessment,
  languages: languagesAssessment,
  music: musicAssessment,
  art: artAssessment,
};

export function generateAssessment(subjectId: string, selectedFields: string[]): AssessmentQuestion[] {
  const bank = assessmentBanks[subjectId] || [];
  
  let filtered: AssessmentQuestion[] = [];
  selectedFields.forEach(field => {
    const fieldQuestions = bank.filter(q => q.field === field);
    filtered = [...filtered, ...fieldQuestions.slice(0, 4)];
  });
  
  // Ensure minimum 15 questions
  if (filtered.length < 15) {
    const remaining = bank.filter(q => !filtered.includes(q));
    filtered = [...filtered, ...remaining.slice(0, 15 - filtered.length)];
  }
  
  return filtered;
}

// ─── SUBJECT FIELD MAP ─────────────────────────────────────
export const subjectFieldsMap: Record<string, { id: string; name: string; icon: string }[]> = {
  math: [
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
  ],
  science: [
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
  ],
  history: [
    { id: "ancient_history", name: "Ancient History", icon: "🏛️" },
    { id: "medieval_history", name: "Medieval History", icon: "⚔️" },
    { id: "modern_history", name: "Modern History", icon: "🏭" },
    { id: "world_wars", name: "World Wars", icon: "🎖️" },
    { id: "american_history", name: "American History", icon: "🗽" },
    { id: "european_history", name: "European History", icon: "🏰" },
    { id: "asian_history", name: "Asian History", icon: "🏯" },
    { id: "art_history", name: "Art History", icon: "🎨" },
  ],
  coding: [
    { id: "python", name: "Python", icon: "🐍" },
    { id: "javascript", name: "JavaScript", icon: "📜" },
    { id: "typescript", name: "TypeScript", icon: "💎" },
    { id: "react", name: "React", icon: "⚛️" },
    { id: "algorithms", name: "Algorithms", icon: "🔄" },
    { id: "data_structures", name: "Data Structures", icon: "📦" },
    { id: "databases", name: "Databases", icon: "🗄️" },
    { id: "web_dev", name: "Web Development", icon: "🌐" },
    { id: "machine_learning", name: "Machine Learning", icon: "🤖" },
  ],
  languages: [
    { id: "spanish", name: "Spanish", icon: "🇪🇸" },
    { id: "french", name: "French", icon: "🇫🇷" },
    { id: "german", name: "German", icon: "🇩🇪" },
    { id: "japanese", name: "Japanese", icon: "🇯🇵" },
    { id: "chinese", name: "Chinese (Mandarin)", icon: "🇨🇳" },
    { id: "korean", name: "Korean", icon: "🇰🇷" },
    { id: "italian", name: "Italian", icon: "🇮🇹" },
    { id: "portuguese", name: "Portuguese", icon: "🇵🇹" },
  ],
  music: [
    { id: "music_theory", name: "Music Theory", icon: "🎼" },
    { id: "piano", name: "Piano", icon: "🎹" },
    { id: "guitar", name: "Guitar", icon: "🎸" },
    { id: "composition", name: "Composition", icon: "✍️" },
    { id: "ear_training", name: "Ear Training", icon: "👂" },
    { id: "music_production", name: "Music Production", icon: "🎧" },
  ],
  art: [
    { id: "drawing", name: "Drawing Fundamentals", icon: "✏️" },
    { id: "painting", name: "Painting", icon: "🎨" },
    { id: "digital_art", name: "Digital Art", icon: "💻" },
    { id: "graphic_design", name: "Graphic Design", icon: "🖼️" },
    { id: "ui_ux", name: "UI/UX Design", icon: "📱" },
    { id: "3d_modeling", name: "3D Modeling", icon: "🧊" },
  ],
};
