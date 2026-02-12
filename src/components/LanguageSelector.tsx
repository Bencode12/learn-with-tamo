import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "uk", name: "Українська", flag: "🇺🇦" }
  ];

  // Ensure flags render properly in both light and dark mode
  const flagStyle = "text-base leading-none drop-shadow-none";

  const selectedLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <Select value={language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-44">
        <div className="flex items-center space-x-2">
          <Languages className="h-4 w-4" />
          <span className="flex items-center space-x-2 truncate">
            <span className={flagStyle}>{selectedLanguage.flag}</span>
            <span className="truncate">{selectedLanguage.name}</span>
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center space-x-2">
              <span className={flagStyle}>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
