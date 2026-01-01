import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App.tsx';
import './index.css';

// Initialize theme on app startup
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  
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
  
  if (savedTheme === 'auto') {
    document.documentElement.setAttribute("data-theme", getSeasonalTheme());
  } else {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
  
  // Set up periodic check for auto theme updates
  if (savedTheme === 'auto') {
    setInterval(() => {
      document.documentElement.setAttribute("data-theme", getSeasonalTheme());
    }, 60000); // Update every minute
  }
};

initializeTheme();

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
);
