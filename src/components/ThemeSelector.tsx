import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette } from "lucide-react";

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('theme') || "auto";
  });

  const getSeasonalTheme = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const hour = now.getHours();  // 0-23
    const isDaytime = hour >= 6 && hour < 18;

    // Autumn: September (8), October (9), November (10)
    if (month >= 8 && month <= 10) {
      return isDaytime ? "sunset" : "dark";
    }
    // Winter: December (11), January (0), February (1)
    if (month === 11 || month <= 1) {
      return isDaytime ? "ocean" : "dark";
    }
    // Spring: March (2), April (3), May (4)
    if (month >= 2 && month <= 4) {
      return isDaytime ? "forest" : "dark";
    }
    // Summer: June (5), July (6), August (7)
    return isDaytime ? "light" : "dark";
  };

  const getThemePreviewColor = (themeId: string) => {
    switch (themeId) {
      case 'light':
        return '#f8fafc';
      case 'dark':
        return '#0f172a';
      case 'ocean':
        return '#e0f2fe';
      case 'sunset':
        return '#fff7ed';
      case 'forest':
        return '#f0fdf4';
      default:
        return '#f8fafc';
    }
  };

  useEffect(() => {
    localStorage.setItem('theme', selectedTheme);
    
    const updateTheme = () => {
      if (selectedTheme === "auto") {
        const autoTheme = getSeasonalTheme();
        document.documentElement.setAttribute("data-theme", autoTheme);
      } else {
        document.documentElement.setAttribute("data-theme", selectedTheme);
      }
    };
    
    updateTheme();
    
    // For auto theme, update periodically to reflect time changes
    let interval: NodeJS.Timeout;
    if (selectedTheme === "auto") {
      interval = setInterval(updateTheme, 60000); // Update every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTheme]);

  const themes = [
    { id: "auto", name: "Auto (Seasonal)", description: "Changes based on season and time" },
    { id: "light", name: "Light", description: "Light color scheme" },
    { id: "dark", name: "Dark", description: "Dark color scheme" },
    { id: "ocean", name: "Ocean", description: "Blue ocean theme" },
    { id: "sunset", name: "Sunset", description: "Warm sunset colors" },
    { id: "forest", name: "Forest", description: "Natural green theme" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Theme Selection</span>
        </CardTitle>
        <CardDescription>Choose your preferred color theme</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
          <div className="space-y-3">
            {themes.map((theme) => (
              <div 
                key={theme.id} 
                className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 ${selectedTheme === theme.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <RadioGroupItem value={theme.id} id={theme.id} />
                <Label htmlFor={theme.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-sm text-muted-foreground">{theme.description}</div>
                </Label>
                {theme.id !== 'auto' && (
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{
                      backgroundColor: getThemePreviewColor(theme.id)
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </RadioGroup>
        {selectedTheme === "auto" && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Current auto theme:</strong> {getSeasonalTheme().charAt(0).toUpperCase() + getSeasonalTheme().slice(1)}
            </p>
            <p className="text-xs text-blue-600 mt-1 dark:text-blue-400">
              Theme changes automatically based on your timezone, season, and time of day.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;