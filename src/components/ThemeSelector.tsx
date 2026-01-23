import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette } from "lucide-react";

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('theme') || "light";
  });

  useEffect(() => {
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, [selectedTheme]);

  const themes = [
    { id: "light", name: "Light", description: "Clean light theme" },
    { id: "dark", name: "Dark", description: "Easy on the eyes" },
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
        <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <div 
                key={theme.id} 
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTheme === theme.id 
                    ? 'border-foreground/20 bg-muted/50' 
                    : 'border-border/40 hover:bg-muted/30'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <RadioGroupItem value={theme.id} id={theme.id} />
                <Label htmlFor={theme.id} className="cursor-pointer">
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-sm text-muted-foreground">{theme.description}</div>
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
