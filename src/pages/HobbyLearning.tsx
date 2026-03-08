import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, ArrowRight, Music, Camera, Palette, ChefHat, Wrench, Gamepad2, Dumbbell, Flower2, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface LessonData {
  title: string;
  description: string;
  duration_minutes: number;
  sections: { title: string; type: string; content: string }[];
  quiz: { question: string; options: string[]; correct: number; explanation: string }[];
  key_concepts: string[];
}

const HobbyLearning = () => {
  const navigate = useNavigate();
  const [selectedHobby, setSelectedHobby] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const hobbies = [
    { id: 'music', name: 'Music & Instruments', icon: Music, lessons: ['Guitar Basics', 'Piano Fundamentals', 'Music Theory', 'Songwriting'] },
    { id: 'photography', name: 'Photography', icon: Camera, lessons: ['Camera Basics', 'Composition', 'Lighting', 'Photo Editing'] },
    { id: 'art', name: 'Art & Drawing', icon: Palette, lessons: ['Sketching', 'Color Theory', 'Digital Art', 'Watercolors'] },
    { id: 'cooking', name: 'Cooking & Baking', icon: ChefHat, lessons: ['Kitchen Basics', 'Baking Bread', 'World Cuisines', 'Meal Prep'] },
    { id: 'diy', name: 'DIY & Crafts', icon: Wrench, lessons: ['Woodworking', 'Sewing', 'Electronics', 'Home Improvement'] },
    { id: 'gaming', name: 'Game Development', icon: Gamepad2, lessons: ['Game Design', 'Unity Basics', 'Pixel Art', 'Sound Design'] },
    { id: 'fitness', name: 'Fitness & Wellness', icon: Dumbbell, lessons: ['Workout Basics', 'Yoga', 'Nutrition', 'Meditation'] },
    { id: 'gardening', name: 'Gardening', icon: Flower2, lessons: ['Plant Care', 'Indoor Plants', 'Vegetable Garden', 'Composting'] },
  ];

  const selectedHobbyData = hobbies.find(h => h.id === selectedHobby);

  const startLesson = async (hobbyName: string, lessonName: string) => {
    setSelectedLesson(lessonName);
    setLessonLoading(true);
    setCurrentSection(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          subject: hobbyName,
          field: hobbyName,
          topic: lessonName,
          difficulty: 'beginner',
          lessonNumber: 1,
          weekNumber: 1,
        }
      });
      if (error) throw error;
      setLessonData(data.lesson);
    } catch {
      toast.error('Failed to generate lesson');
      setSelectedLesson(null);
    }
    setLessonLoading(false);
  };

  // Lesson view
  if (selectedLesson && lessonData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedLesson(null); setLessonData(null); }}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <span className="text-sm font-medium truncate">{lessonData.title}</span>
            <Badge variant="outline">{lessonData.duration_minutes}m</Badge>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>{lessonData.sections[currentSection]?.type || 'content'}</Badge>
                <span className="text-sm text-muted-foreground">{currentSection + 1}/{lessonData.sections.length}</span>
              </div>
              <CardTitle>{lessonData.sections[currentSection]?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {typeof lessonData.sections[currentSection]?.content === 'string'
                  ? lessonData.sections[currentSection].content
                  : JSON.stringify(lessonData.sections[currentSection]?.content, null, 2)}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" disabled={currentSection === 0} onClick={() => setCurrentSection(s => s - 1)}>Previous</Button>
            <Button disabled={currentSection >= lessonData.sections.length - 1} onClick={() => setCurrentSection(s => s + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {lessonData.key_concepts?.length > 0 && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Key Concepts</h4>
                <div className="flex flex-wrap gap-2">
                  {lessonData.key_concepts.map((c, i) => <Badge key={i} variant="outline">{c}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  if (selectedLesson && lessonLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Generating {selectedLesson} lesson...</p>
      </div>
    );
  }

  return (
    <AppLayout title="Hobby Learning" subtitle="Explore interests with AI-generated lessons">
      {!selectedHobby ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hobbies.map((hobby) => (
            <Card key={hobby.id} className="hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setSelectedHobby(hobby.id)}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <hobby.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{hobby.name}</h3>
                <p className="text-xs text-muted-foreground">{hobby.lessons.length} lessons</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedHobby(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />All Hobbies
          </Button>

          <div className="flex items-center gap-3 mb-4">
            {selectedHobbyData && <selectedHobbyData.icon className="h-6 w-6 text-primary" />}
            <h2 className="text-xl font-bold">{selectedHobbyData?.name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedHobbyData?.lessons.map((lesson, idx) => (
              <Card key={idx} className="hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <span className="font-medium text-sm">{lesson}</span>
                  </div>
                  <Button size="sm" onClick={() => startLesson(selectedHobbyData.name, lesson)}>
                    <Sparkles className="h-4 w-4 mr-1" />Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default HobbyLearning;
