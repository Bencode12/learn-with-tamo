
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Target, Brain, Clock, Star, Trophy, ArrowRight, ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";

const SingleMode = () => {
  const [currentProgress] = useState(65);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  
  const allSubjects = [
    { id: "math", name: "Mathematics", progress: 78, lessons: 45, icon: "📊" },
    { id: "science", name: "Science", progress: 65, lessons: 32, icon: "🔬" },
    { id: "language", name: "Language Arts", progress: 71, lessons: 38, icon: "📝" },
    { id: "social", name: "Social Studies", progress: 82, lessons: 28, icon: "📚" },
    { id: "cs", name: "Computer Science", progress: 55, lessons: 24, icon: "💻" },
    { id: "arts", name: "Arts", progress: 68, lessons: 19, icon: "🎨" },
    { id: "foreign", name: "Foreign Languages", progress: 42, lessons: 31, icon: "🌍" }
  ];

  const subjects = allSubjects.slice(0, 4);

  const subjectDetails: Record<string, { chapters: { id: string; name: string; lessons: string[] }[] }> = {
    math: {
      chapters: [
        { id: "algebra", name: "Algebra", lessons: ["Introduction to Variables", "Linear Equations", "Quadratic Functions", "Polynomials"] },
        { id: "geometry", name: "Geometry", lessons: ["Basic Shapes", "Angles and Triangles", "Circles", "3D Geometry"] },
        { id: "calculus", name: "Calculus", lessons: ["Limits", "Derivatives", "Integrals", "Applications"] }
      ]
    },
    science: {
      chapters: [
        { id: "physics", name: "Physics", lessons: ["Motion", "Forces", "Energy", "Waves"] },
        { id: "chemistry", name: "Chemistry", lessons: ["Atoms", "Periodic Table", "Chemical Reactions", "Acids and Bases"] },
        { id: "biology", name: "Biology", lessons: ["Cells", "Genetics", "Evolution", "Ecology"] }
      ]
    },
    language: {
      chapters: [
        { id: "grammar", name: "Grammar", lessons: ["Parts of Speech", "Sentence Structure", "Punctuation", "Common Errors"] },
        { id: "writing", name: "Writing", lessons: ["Essay Structure", "Creative Writing", "Research Papers", "Citations"] },
        { id: "literature", name: "Literature", lessons: ["Poetry Analysis", "Novel Study", "Drama", "Literary Devices"] }
      ]
    },
    social: {
      chapters: [
        { id: "history", name: "History", lessons: ["Ancient Civilizations", "World Wars", "Modern History", "Local History"] },
        { id: "geography", name: "Geography", lessons: ["Physical Geography", "Human Geography", "Maps and Navigation", "Climate"] },
        { id: "civics", name: "Civics", lessons: ["Government Structure", "Rights and Responsibilities", "Democracy", "Law"] }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Gamemodes
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Learn at Your Own Pace</h2>
              <p className="text-gray-600">Master subjects with AI-powered personalized lessons</p>
            </div>
            <Badge className="bg-green-500 text-white">
              <Target className="h-4 w-4 mr-1" />
              Single Player
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Your Learning Journey</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{subject.icon}</div>
                    <div>
                      <CardTitle>{subject.name}</CardTitle>
                      <CardDescription>{subject.lessons} lessons completed</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{subject.progress}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={subject.progress} className="h-2" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>~30 min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>+50 XP</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => { setSelectedSubject(subject.id); setSelectedChapter(null); }}>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {!selectedChapter ? `Select Chapter - ${subject.name}` : `Select Lesson`}
                        </DialogTitle>
                      </DialogHeader>
                      {!selectedChapter ? (
                        <div className="grid grid-cols-1 gap-3">
                          {subjectDetails[subject.id]?.chapters.map((chapter) => (
                            <Card key={chapter.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedChapter(chapter.id)}>
                              <CardContent className="p-4">
                                <h4 className="font-semibold">{chapter.name}</h4>
                                <p className="text-sm text-gray-600">{chapter.lessons.length} lessons</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedChapter(null)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Chapters
                          </Button>
                          {subjectDetails[subject.id]?.chapters
                            .find(ch => ch.id === selectedChapter)
                            ?.lessons.map((lesson, idx) => (
                              <Card key={idx} className="cursor-pointer hover:bg-gray-50">
                                <CardContent className="p-4 flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium">{lesson}</h5>
                                    <p className="text-sm text-gray-600">Lesson {idx + 1}</p>
                                  </div>
                                           <Link to={`/lesson-start?title=${encodeURIComponent(lesson)}&subject=${encodeURIComponent(subject.name)}&chapter=${encodeURIComponent(subjectDetails[subject.id]?.chapters.find(ch => ch.id === selectedChapter)?.name || '')}&coins=50&duration=30&xp=100&difficulty=Beginner`}>
                                             <Button size="sm">Start</Button>
                                           </Link>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View More Card */}
        <Card className="mb-8 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">View More Subjects</h3>
            <p className="text-sm text-gray-600 mb-4">
              Explore {allSubjects.length - 4} more subjects: {allSubjects.slice(4).map(s => s.name).join(", ")}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  View All Subjects
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>All Available Subjects</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  {allSubjects.map((subject) => (
                    <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{subject.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                            <CardDescription>{subject.lessons} lessons</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                       <CardContent>
                         <Progress value={subject.progress} className="h-2 mb-2" />
                         <div className="flex items-center justify-between">
                           <span className="text-sm text-gray-600">{subject.progress}% complete</span>
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button size="sm" onClick={() => { setSelectedSubject(subject.id); setSelectedChapter(null); }}>
                                 Start Learning
                               </Button>
                             </DialogTrigger>
                             <DialogContent className="max-w-2xl">
                               <DialogHeader>
                                 <DialogTitle>
                                   {!selectedChapter ? `Select Chapter - ${subject.name}` : `Select Lesson`}
                                 </DialogTitle>
                               </DialogHeader>
                               {!selectedChapter ? (
                                 <div className="grid grid-cols-1 gap-3">
                                   {subjectDetails[subject.id]?.chapters.map((chapter) => (
                                     <Card key={chapter.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedChapter(chapter.id)}>
                                       <CardContent className="p-4">
                                         <h4 className="font-semibold">{chapter.name}</h4>
                                         <p className="text-sm text-gray-600">{chapter.lessons.length} lessons</p>
                                       </CardContent>
                                     </Card>
                                   ))}
                                 </div>
                               ) : (
                                 <div className="space-y-3">
                                   <Button variant="ghost" size="sm" onClick={() => setSelectedChapter(null)}>
                                     <ArrowLeft className="h-4 w-4 mr-2" />
                                     Back to Chapters
                                   </Button>
                                   {subjectDetails[subject.id]?.chapters
                                     .find(ch => ch.id === selectedChapter)
                                     ?.lessons.map((lesson, idx) => (
                                       <Card key={idx} className="cursor-pointer hover:bg-gray-50">
                                         <CardContent className="p-4 flex items-center justify-between">
                                           <div>
                                             <h5 className="font-medium">{lesson}</h5>
                                             <p className="text-sm text-gray-600">Lesson {idx + 1}</p>
                                           </div>
                                           <Button size="sm">Start</Button>
                                         </CardContent>
                                       </Card>
                                     ))}
                                 </div>
                               )}
                             </DialogContent>
                           </Dialog>
                         </div>
                       </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Daily Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Daily Challenges</span>
            </CardTitle>
            <CardDescription>Complete these for bonus rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Math Master</h4>
                <p className="text-sm text-blue-700">Complete 3 algebra lessons</p>
                <div className="mt-2">
                  <Progress value={66} className="h-2" />
                  <p className="text-xs text-blue-600 mt-1">2/3 completed</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900">Science Explorer</h4>
                <p className="text-sm text-green-700">Study chemistry for 20 minutes</p>
                <div className="mt-2">
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-green-600 mt-1">✓ Completed</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">Perfect Score</h4>
                <p className="text-sm text-purple-700">Get 100% on any quiz</p>
                <div className="mt-2">
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-purple-600 mt-1">0/1 completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SingleMode;