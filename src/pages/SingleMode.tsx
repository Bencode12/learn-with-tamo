import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Target, Brain, Clock, Star, Trophy, ArrowRight, ArrowLeft, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { lessonData, getAccessibleSubjects } from "@/data/lessonContent";
import { useLearningTime } from "@/hooks/useLearningTime";

const SingleMode = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const { isPremium, formatRemainingTime, canLearn } = useLearningTime();

  const allSubjects = lessonData;

  const handleStartLesson = (subjectId: string, chapterId: string, lessonId: string) => {
    if (!canLearn()) return;
    navigate(`/lesson-start/${subjectId}/${chapterId}/${lessonId}`);
  };

  const getSubject = (id: string) => allSubjects.find(s => s.id === id);
  
  const resetSelection = () => {
    setSelectedField(null);
    setSelectedChapter(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Learning Modules
                </Button>
              </Link>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold">SūdžiusAI</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {!isPremium && (
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRemainingTime()} left today
                </Badge>
              )}
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Learn at Your Own Pace</h2>
              <p className="text-muted-foreground">Master subjects with AI-powered personalized lessons</p>
            </div>
            <Badge className="bg-green-500 text-white">
              <Target className="h-4 w-4 mr-1" />
              Single Player
            </Badge>
          </div>
        </div>

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
                <span>65%</span>
              </div>
              <Progress value={65} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {allSubjects.map((subject) => {
            const isLocked = subject.isPremium && !isPremium;
            const hasFields = subject.fields && subject.fields.length > 0;
            const totalLessons = hasFields 
              ? subject.fields.reduce((acc, f) => acc + f.chapters.reduce((a, c) => a + c.lessons.length, 0), 0)
              : subject.chapters?.reduce((acc, c) => acc + c.lessons.length, 0) || 0;
            
            return (
              <Card key={subject.id} className={`hover:shadow-lg transition-shadow ${isLocked ? 'opacity-75' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{subject.icon}</div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {subject.name}
                          {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                        </CardTitle>
                        <CardDescription>{totalLessons} lessons</CardDescription>
                      </div>
                    </div>
                    {isLocked && <Badge variant="secondary">Premium</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={65} className="h-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>~30 min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>+50 XP</span>
                      </div>
                    </div>
                    {isLocked ? (
                      <Link to="/store">
                        <Button size="sm" variant="outline">
                          <Lock className="h-4 w-4 mr-1" />
                          Unlock
                        </Button>
                      </Link>
                    ) : (
                      <Dialog onOpenChange={(open) => { if (!open) resetSelection(); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedSubject(subject.id)}>
                            Continue
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {!selectedField && !selectedChapter && `Select ${hasFields ? 'Field' : 'Chapter'} - ${subject.name}`}
                              {selectedField && !selectedChapter && `Select Chapter`}
                              {selectedChapter && `Select Lesson`}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {/* Fields selection (for subjects with fields) */}
                          {hasFields && !selectedField && (
                            <div className="grid grid-cols-1 gap-3">
                              {subject.fields?.map((field) => (
                                <Card key={field.id} className="cursor-pointer hover:bg-muted" onClick={() => setSelectedField(field.id)}>
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold">{field.name}</h4>
                                    <p className="text-sm text-muted-foreground">{field.chapters.length} chapters</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}

                          {/* Chapters selection */}
                          {((hasFields && selectedField && !selectedChapter) || (!hasFields && !selectedChapter)) && (
                            <div className="space-y-3">
                              {hasFields && selectedField && (
                                <Button variant="ghost" size="sm" onClick={() => setSelectedField(null)}>
                                  <ArrowLeft className="h-4 w-4 mr-2" />
                                  Back to Fields
                                </Button>
                              )}
                              <div className="grid grid-cols-1 gap-3">
                                {(hasFields 
                                  ? subject.fields?.find(f => f.id === selectedField)?.chapters 
                                  : subject.chapters
                                )?.map((chapter) => (
                                  <Card key={chapter.id} className="cursor-pointer hover:bg-muted" onClick={() => setSelectedChapter(chapter.id)}>
                                    <CardContent className="p-4">
                                      <h4 className="font-semibold">{chapter.name}</h4>
                                      <p className="text-sm text-muted-foreground">{chapter.lessons.length} lessons</p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lessons selection */}
                          {selectedChapter && (
                            <div className="space-y-3">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedChapter(null)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Chapters
                              </Button>
                              {(hasFields 
                                ? subject.fields?.find(f => f.id === selectedField)?.chapters.find(c => c.id === selectedChapter)
                                : subject.chapters?.find(c => c.id === selectedChapter)
                              )?.lessons.map((lesson, idx) => (
                                <Card key={lesson.id} className="cursor-pointer hover:bg-muted">
                                  <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium">{lesson.title}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        Lesson {idx + 1} • {lesson.type === 'leetcode' ? 'Coding' : lesson.type === 'duolingo' ? 'Interactive' : 'Video'}
                                      </p>
                                    </div>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleStartLesson(subject.id, selectedChapter, lesson.id)}
                                      disabled={!canLearn()}
                                    >
                                      Start
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Math Master</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Complete 3 algebra lessons</p>
                <div className="mt-2">
                  <Progress value={66} className="h-2" />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">2/3 completed</p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100">Science Explorer</h4>
                <p className="text-sm text-green-700 dark:text-green-300">Study chemistry for 20 minutes</p>
                <div className="mt-2">
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Completed</p>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Perfect Score</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">Get 100% on any quiz</p>
                <div className="mt-2">
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">0/1 completed</p>
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
