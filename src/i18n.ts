import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import uzTranslation from "./locales/uz.json";
import uzCyrlTranslation from "./locales/uz-cyrl.json";
import ruTranslation from "./locales/ru.json";

const resources = {
  uz: {
    translation: uzTranslation,
  },
  cyrl: {
    translation: uzCyrlTranslation,
  },
  ru: {
    translation: ruTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "uz", // Default language
    debug: false,

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Language names for display
    supportedLngs: ["uz", "cyrl", "ru"],

    // Remove load: 'languageOnly' to allow full language codes
  });

export default i18n;
