import { useTranslation as useI18nTranslation } from "react-i18next";

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return [
      { code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
      { code: "cyrl", name: "Ўзбекча", flag: "🇺🇿" },
      { code: "ru", name: "Русский", flag: "🇷🇺" },
    ];
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    i18n,
  };
};
