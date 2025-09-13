
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";

const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ru", name: "Русский", flag: "🇷🇺" }
  ];

  // Basic translations for common UI elements
  const translations = {
    en: { dashboard: "Dashboard", shop: "Shop", profile: "Profile", settings: "Settings" },
    lt: { dashboard: "Valdymo skydas", shop: "Parduotuvė", profile: "Profilis", settings: "Nustatymai" },
    es: { dashboard: "Tablero", shop: "Tienda", profile: "Perfil", settings: "Configuración" },
    fr: { dashboard: "Tableau de bord", shop: "Boutique", profile: "Profil", settings: "Paramètres" },
    de: { dashboard: "Dashboard", shop: "Shop", profile: "Profil", settings: "Einstellungen" },
    ru: { dashboard: "Панель", shop: "Магазин", profile: "Профиль", settings: "Настройки" }
  };

  const t = (key: keyof typeof translations.en) => {
    return translations[selectedLanguage as keyof typeof translations]?.[key] || translations.en[key];
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Store language preference in localStorage
    localStorage.setItem('selectedLanguage', languageCode);
    console.log("Language changed to:", languageCode);
  };

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-40">
        <div className="flex items-center space-x-2">
          <Languages className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center space-x-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
