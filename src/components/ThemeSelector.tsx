import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Sun, Moon, Leaf, Waves, Sunset, Sparkles } from "lucide-react";
import { useTheme, Theme } from "@/hooks/useTheme";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; name: string; description: string; icon: React.ReactNode }[] = [
    { id: "light", name: "Light", description: "Clean light theme", icon: <Sun className="h-4 w-4" /> },
    { id: "dark", name: "Dark", description: "Easy on the eyes", icon: <Moon className="h-4 w-4" /> },
    { id: "ocean", name: "Ocean", description: "Calm blue tones", icon: <Waves className="h-4 w-4" /> },
    { id: "sunset", name: "Sunset", description: "Warm orange hues", icon: <Sunset className="h-4 w-4" /> },
    { id: "forest", name: "Forest", description: "Natural green palette", icon: <Leaf className="h-4 w-4" /> },
    { id: "auto", name: "Auto", description: "Changes with seasons", icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          Theme
        </CardTitle>
        <CardDescription>Choose your preferred appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themes.map((t) => (
              <div 
                key={t.id} 
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  theme === t.id 
                    ? 'border-foreground/20 bg-muted/50' 
                    : 'border-border/40 hover:bg-muted/30'
                }`}
                onClick={() => setTheme(t.id)}
              >
                <RadioGroupItem value={t.id} id={t.id} />
                <Label htmlFor={t.id} className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    {t.icon}
                    <span className="font-medium">{t.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
