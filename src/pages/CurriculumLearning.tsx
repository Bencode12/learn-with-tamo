import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Filter, Calendar, Clock, Users } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

const subjects = [
  {
    id: 'mathematics',
    title: 'Mathematics',
    icon: BookOpen,
    levels: 'K-12, University, Graduate, PhD',
    description: 'Algebra, geometry, calculus, statistics, and advanced mathematical theory.',
    courses: [
      { name: 'Algebra Basics', duration: '8 weeks', students: 1247 },
      { name: 'Calculus I', duration: '12 weeks', students: 892 },
      { name: 'Linear Algebra', duration: '10 weeks', students: 634 },
    ]
  },
  {
    id: 'sciences',
    title: 'Sciences',
    icon: BookOpen,
    levels: 'K-12, University, Graduate, PhD',
    description: 'Biology, chemistry, physics, earth sciences, and laboratory research.',
    courses: [
      { name: 'Introduction to Biology', duration: '10 weeks', students: 1542 },
      { name: 'Organic Chemistry', duration: '14 weeks', students: 723 },
      { name: 'Physics Fundamentals', duration: '12 weeks', students: 967 },
    ]
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: BookOpen,
    levels: 'K-12, University, Graduate, PhD',
    description: 'English, literature, foreign languages, linguistics, and communication.',
    courses: [
      { name: 'English Composition', duration: '8 weeks', students: 2105 },
      { name: 'Spanish I', duration: '12 weeks', students: 1342 },
      { name: 'Advanced Literature', duration: '10 weeks', students: 456 },
    ]
  },
  {
    id: 'social-studies',
    title: 'Social Studies',
    icon: BookOpen,
    levels: 'K-12, University, Graduate, PhD',
    description: 'History, geography, civics, economics, and social sciences.',
    courses: [
      { name: 'World History', duration: '16 weeks', students: 1789 },
      { name: 'Geography Essentials', duration: '8 weeks', students: 1234 },
      { name: 'Modern Economics', duration: '10 weeks', students: 678 },
    ]
  },
  {
    id: 'arts',
    title: 'Arts & Humanities',
    icon: BookOpen,
    levels: 'K-12, University, Graduate, PhD',
    description: 'Visual arts, music, drama, philosophy, and cultural studies.',
    courses: [
      { name: 'Art History Survey', duration: '12 weeks', students: 891 },
      { name: 'Music Theory', duration: '10 weeks', students: 567 },
      { name: 'Creative Writing', duration: '8 weeks', students: 1023 },
    ]
  },
  {
    id: 'technology',
    title: 'Technology & Computer Science',
    icon: BookOpen,
    levels: 'K-12, University, Graduate, PhD',
    description: 'Programming, computer science, digital literacy, and emerging technologies.',
    courses: [
      { name: 'Python Programming', duration: '12 weeks', students: 2341 },
      { name: 'Web Development', duration: '14 weeks', students: 1876 },
      { name: 'Data Science Fundamentals', duration: '16 weeks', students: 934 },
    ]
  }
];

const CurriculumLearning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || subject.levels.includes(selectedLevel);
    const matchesSubject = selectedSubject === 'all' || subject.id === selectedSubject;
    
    return matchesSearch && matchesLevel && matchesSubject;
  });

  return (
    <AppLayout title="Curriculum Learning" subtitle="Explore structured learning paths across all subjects and levels">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search subjects, courses, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="K-12">K-12</SelectItem>
              <SelectItem value="University">University</SelectItem>
              <SelectItem value="Graduate">Graduate</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="sciences">Sciences</SelectItem>
              <SelectItem value="languages">Languages</SelectItem>
              <SelectItem value="social-studies">Social Studies</SelectItem>
              <SelectItem value="arts">Arts & Humanities</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Card key={subject.id} className="border-border/40 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{subject.title}</CardTitle>
                      <CardDescription>{subject.levels}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm">Popular Courses:</h4>
                    {subject.courses.map((course, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="truncate">{course.name}</span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{course.duration}</span>
                          <Users className="h-3 w-3 ml-2" />
                          <span>{course.students}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link to={`/self-learning?subject=${subject.id}`}>
                    <Button className="w-full" variant="outline">
                      Start Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No subjects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CurriculumLearning;