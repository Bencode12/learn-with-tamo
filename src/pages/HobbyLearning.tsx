import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, BookOpen, Music, Camera, Palette, ChefHat, Wrench, Gamepad2, Dumbbell, Flower2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const HobbyLearning = () => {
  const navigate = useNavigate();
  const [selectedHobby, setSelectedHobby] = useState<string | null>(null);

  const hobbies = [
    { id: 'music', name: 'Music & Instruments', icon: Music, color: 'bg-purple-500', lessons: ['Guitar Basics', 'Piano Fundamentals', 'Music Theory', 'Songwriting'] },
    { id: 'photography', name: 'Photography', icon: Camera, color: 'bg-blue-500', lessons: ['Camera Basics', 'Composition', 'Lighting', 'Photo Editing'] },
    { id: 'art', name: 'Art & Drawing', icon: Palette, color: 'bg-pink-500', lessons: ['Sketching', 'Color Theory', 'Digital Art', 'Watercolors'] },
    { id: 'cooking', name: 'Cooking & Baking', icon: ChefHat, color: 'bg-orange-500', lessons: ['Kitchen Basics', 'Baking Bread', 'World Cuisines', 'Meal Prep'] },
    { id: 'diy', name: 'DIY & Crafts', icon: Wrench, color: 'bg-yellow-500', lessons: ['Woodworking', 'Sewing', 'Electronics', 'Home Improvement'] },
    { id: 'gaming', name: 'Game Development', icon: Gamepad2, color: 'bg-green-500', lessons: ['Game Design', 'Unity Basics', 'Pixel Art', 'Sound Design'] },
    { id: 'fitness', name: 'Fitness & Wellness', icon: Dumbbell, color: 'bg-red-500', lessons: ['Workout Basics', 'Yoga', 'Nutrition', 'Meditation'] },
    { id: 'gardening', name: 'Gardening', icon: Flower2, color: 'bg-emerald-500', lessons: ['Plant Care', 'Indoor Plants', 'Vegetable Garden', 'Composting'] },
  ];

  const selectedHobbyData = hobbies.find(h => h.id === selectedHobby);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/game-modes"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-base">K</span>
                </div>
                <h1 className="text-xl font-bold">KnowIt AI</h1>
              </Link>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!selectedHobby ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Heart className="h-12 w-12 mx-auto text-rose-500 mb-4" />
              <h2 className="text-3xl font-bold">Hobby Learning</h2>
              <p className="text-muted-foreground">Explore new interests and learn something fun!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hobbies.map((hobby) => (
                <Card key={hobby.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedHobby(hobby.id)}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${hobby.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <hobby.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{hobby.name}</h3>
                    <p className="text-sm text-muted-foreground">{hobby.lessons.length} lessons</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedHobby(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hobbies
            </Button>

            <Card className={`${selectedHobbyData?.color} text-white`}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {selectedHobbyData && <selectedHobbyData.icon className="h-12 w-12" />}
                  <div>
                    <CardTitle className="text-2xl">{selectedHobbyData?.name}</CardTitle>
                    <CardDescription className="text-white/80">{selectedHobbyData?.lessons.length} lessons available</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedHobbyData?.lessons.map((lesson, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{lesson}</h4>
                      <p className="text-sm text-muted-foreground">Lesson {idx + 1}</p>
                    </div>
                    <Button size="sm" onClick={() => navigate('/single-mode')}>Start</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HobbyLearning;
