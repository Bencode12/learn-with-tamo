import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "pl", name: "Polski", flag: "🇵🇱" },
    { code: "uk", name: "Українська", flag: "🇺🇦" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "th", name: "ไทย", flag: "🇹🇭" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" }
  ];

  const selectedLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <Select value={language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-44">
        <div className="flex items-center space-x-2">
          <Languages className="h-4 w-4" />
          <span className="flex items-center space-x-2 truncate">
            <span>{selectedLanguage.flag}</span>
            <span className="truncate">{selectedLanguage.name}</span>
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;