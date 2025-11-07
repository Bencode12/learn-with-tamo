import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const translations = {
  en: {
    dashboard: 'Dashboard',
    shop: 'Store',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    leaderboard: 'Leaderboard',
    friends: 'Friends',
    notifications: 'Notifications',
    lives: 'Lives',
    premium: 'Premium',
    gameModes: 'Game Modes',
    singlePlayer: 'Single Player',
    duos: 'Duos',
    team: 'Team',
    ranked: 'Ranked',
    exams: 'Exams',
    progress: 'Progress',
    startLearning: 'Start Learning',
    backTo: 'Back to',
    lessons: 'Lessons',
    achievements: 'Achievements',
    streak: 'Streak',
    level: 'Level',
    xp: 'XP',
    hours: 'Hours',
    score: 'Score'
  },
  lt: {
    dashboard: 'Valdymo skydas',
    shop: 'Parduotuvė',
    profile: 'Profilis',
    settings: 'Nustatymai',
    logout: 'Atsijungti',
    login: 'Prisijungti',
    signup: 'Registruotis',
    leaderboard: 'Lyderių lenta',
    friends: 'Draugai',
    notifications: 'Pranešimai',
    lives: 'Gyvybės',
    premium: 'Premium',
    gameModes: 'Žaidimo režimai',
    singlePlayer: 'Vienas žaidėjas',
    duos: 'Duetai',
    team: 'Komanda',
    ranked: 'Reitinguotas',
    exams: 'Egzaminai',
    progress: 'Pažanga',
    startLearning: 'Pradėti mokytis',
    backTo: 'Grįžti į',
    lessons: 'Pamokos',
    achievements: 'Pasiekimai',
    streak: 'Serija',
    level: 'Lygis',
    xp: 'Patirtis',
    hours: 'Valandos',
    score: 'Rezultatas'
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    lt: { translation: translations.lt }
  },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

interface LanguageContextType {
  language: string;
  changeLanguage: (lng: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(i18n.language);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const t = (key: string) => i18n.t(key);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};