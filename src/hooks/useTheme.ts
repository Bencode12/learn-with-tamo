import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'auto';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  });

  const getSeasonalTheme = (): 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' => {
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 18;

    if (month >= 8 && month <= 10) {
      return isDaytime ? "sunset" : "dark";
    }
    if (month === 11 || month <= 1) {
      return isDaytime ? "ocean" : "dark";
    }
    if (month >= 2 && month <= 4) {
      return isDaytime ? "forest" : "dark";
    }
    return isDaytime ? "light" : "dark";
  };

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
    
    if (selectedTheme === 'auto') {
      const actualTheme = getSeasonalTheme();
      if (actualTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.setAttribute('data-theme', actualTheme);
      }
    } else if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else if (selectedTheme !== 'light') {
      root.setAttribute('data-theme', selectedTheme);
    }
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

  // Auto theme update interval
  useEffect(() => {
    if (theme === 'auto') {
      const interval = setInterval(() => {
        applyTheme('auto');
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [theme]);

  const toggleDarkMode = () => {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleDarkMode };
};
