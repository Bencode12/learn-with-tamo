import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App.tsx';
import './index.css';

// Initialize theme on app startup
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const root = document.documentElement;
  
  const getSeasonalTheme = () => {
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
  
  // Remove all theme classes first
  root.classList.remove('dark');
  root.removeAttribute('data-theme');
  
  if (savedTheme === 'auto') {
    const actualTheme = getSeasonalTheme();
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else if (actualTheme !== 'light') {
      root.setAttribute('data-theme', actualTheme);
    }
  } else if (savedTheme === 'dark') {
    root.classList.add('dark');
  } else if (savedTheme !== 'light') {
    root.setAttribute('data-theme', savedTheme);
  }
  
  // Set up periodic check for auto theme updates
  if (savedTheme === 'auto') {
    setInterval(() => {
      const actualTheme = getSeasonalTheme();
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      if (actualTheme === 'dark') {
        root.classList.add('dark');
      } else if (actualTheme !== 'light') {
        root.setAttribute('data-theme', actualTheme);
      }
    }, 60000);
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
