import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
  };
  preview: string;
}

const predefinedThemes: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and professional",
    colors: {
      background: "#ffffff",
      text: "#1f2937",
      accent: "#3b82f6",
      secondary: "#f3f4f6"
    },
    preview: "bg-white text-gray-800 border-blue-500"
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Easy on the eyes",
    colors: {
      background: "#1f2937",
      text: "#f9fafb",
      accent: "#60a5fa",
      secondary: "#374151"
    },
    preview: "bg-gray-800 text-gray-100 border-blue-400"
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Calm blue tones",
    colors: {
      background: "#f0f9ff",
      text: "#0c4a6e",
      accent: "#0ea5e9",
      secondary: "#e0f2fe"
    },
    preview: "bg-sky-50 text-sky-900 border-sky-500"
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural green theme",
    colors: {
      background: "#f0fdf4",
      text: "#14532d",
      accent: "#22c55e",
      secondary: "#dcfce7"
    },
    preview: "bg-green-50 text-green-900 border-green-500"
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and red",
    colors: {
      background: "#fff7ed",
      text: "#9a3412",
      accent: "#ea580c",
      secondary: "#fed7aa"
    },
    preview: "bg-orange-50 text-orange-800 border-orange-500"
  },
  {
    id: "purple",
    name: "Purple",
    description: "Rich and vibrant",
    colors: {
      background: "#faf5ff",
      text: "#581c87",
      accent: "#a855f7",
      secondary: "#e9d5ff"
    },
    preview: "bg-purple-50 text-purple-900 border-purple-500"
  }
];

const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>("default");

  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem("selectedTheme", themeId);
    
    const theme = predefinedThemes.find(t => t.id === themeId);
    if (theme) {
      // Apply theme to CSS custom properties
      document.documentElement.style.setProperty('--theme-background', theme.colors.background);
      document.documentElement.style.setProperty('--theme-text', theme.colors.text);
      document.documentElement.style.setProperty('--theme-accent', theme.colors.accent);
      document.documentElement.style.setProperty('--theme-secondary', theme.colors.secondary);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Theme Selection</span>
        </CardTitle>
        <CardDescription>Choose a theme for your interface (like Monkeytype)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedThemes.map((theme) => (
            <div
              key={theme.id}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                selectedTheme === theme.id 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <Check className="h-5 w-5 text-blue-600" />
                </div>
              )}
              
              <div className={`w-full h-16 rounded mb-3 border-2 ${theme.preview} flex items-center justify-center`}>
                <div className="text-sm font-medium">Sample Text</div>
              </div>
              
              <h4 className="font-semibold text-sm mb-1">{theme.name}</h4>
              <p className="text-xs text-gray-600">{theme.description}</p>
              
              <div className="flex space-x-1 mt-2">
                {Object.values(theme.colors).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Current Theme Preview</h4>
          <div className="p-4 rounded border-2" style={{
            backgroundColor: predefinedThemes.find(t => t.id === selectedTheme)?.colors.background,
            color: predefinedThemes.find(t => t.id === selectedTheme)?.colors.text,
            borderColor: predefinedThemes.find(t => t.id === selectedTheme)?.colors.accent
          }}>
            <div className="font-semibold">This is how your interface will look</div>
            <div className="text-sm mt-1">All text and backgrounds will use these colors</div>
            <Button 
              size="sm" 
              className="mt-2"
              style={{
                backgroundColor: predefinedThemes.find(t => t.id === selectedTheme)?.colors.accent,
                color: predefinedThemes.find(t => t.id === selectedTheme)?.colors.background
              }}
            >
              Sample Button
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;