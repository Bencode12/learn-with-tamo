import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, FlaskConical, Globe2, Languages, Palette } from "lucide-react";

const subjects = [
  {
    title: "Mathematics",
    icon: Calculator,
    levels: "K-12, University, Graduate, PhD",
    description: "Algebra, geometry, statistics, calculus, modeling, and research-grade mathematics.",
  },
  {
    title: "Sciences",
    icon: FlaskConical,
    levels: "K-12, University, Graduate, PhD",
    description: "Biology, chemistry, physics, and interdisciplinary science with practical labs and theory.",
  },
  {
    title: "Language Arts",
    icon: BookOpen,
    levels: "K-12, University, Graduate",
    description: "Reading, writing, grammar, rhetoric, and critical analysis across literary forms.",
  },
  {
    title: "Social Studies",
    icon: Globe2,
    levels: "K-12, University, Graduate",
    description: "History, civics, economics, geography, and policy-oriented discussion.",
  },
  {
    title: "Arts",
    icon: Palette,
    levels: "K-12, University, Graduate",
    description: "Visual arts, music, creative projects, and portfolio-oriented learning.",
  },
  {
    title: "Foreign Languages",
    icon: Languages,
    levels: "K-12, University, Graduate, PhD",
    description: "Core language development, communication, culture, and advanced academic fluency.",
  },
];

const SubjectsOverview = () => {
  return (
    <AppLayout title="Subjects Overview" subtitle="Standalone subject explorer without redirecting to the main landing page.">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          One learning environment is provided per subject to keep curriculum structure consistent across levels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Card key={subject.title} className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {subject.title}
                  </CardTitle>
                  <CardDescription>{subject.levels}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{subject.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Link to="/curriculum">
            <Button>Open Curriculum Learning</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default SubjectsOverview;
