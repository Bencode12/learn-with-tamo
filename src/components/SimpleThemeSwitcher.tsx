import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";

const SimpleThemeSwitcher = () => {
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
    { id: "auto", name: "Auto (Seasonal)" },
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
    { id: "ocean", name: "Ocean" },
    { id: "sunset", name: "Sunset" },
    { id: "forest", name: "Forest" }
  ];

  return (
    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
      <SelectTrigger className="w-40">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SimpleThemeSwitcher;