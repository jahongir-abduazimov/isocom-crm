import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const languages = [
  { code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
  { code: "cyrl", name: "Ўзбекча", flag: "🇺🇿" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false); // Close dropdown after selection
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="flex items-center gap-2 min-w-[120px] justify-start"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe size={16} />
        {/* <span className="text-lg">{currentLanguage.flag}</span> */}
        <span className="text-sm font-medium">{currentLanguage.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-30 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full flex cursor-pointer items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                i18n.language === language.code
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }`}
            >
              {/* <span className="text-lg">{language.flag}</span> */}
              <span className="text-sm font-medium">{language.name}</span>
              {i18n.language === language.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
