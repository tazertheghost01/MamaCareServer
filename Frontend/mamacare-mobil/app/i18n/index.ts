import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import yo from "./locales/yo.json";
import ha from "./locales/ha.json";
import ig from "./locales/ig.json";
import pcm from "./locales/pcm.json";

const resources = {
  en: { translation: en },
  yo: { translation: yo },
  ha: { translation: ha },
  ig: { translation: ig },
  pcm: { translation: pcm },
};

export const languageMap: { [key: string]: string } = {
  English: "en",
  Pidgin: "pcm",
  Yoruba: "yo",
  Hausa: "ha",
  Igbo: "ig",
};

export const reverseLanguageMap: { [key: string]: string } = {
  en: "English",
  pcm: "Pidgin",
  yo: "Yoruba",
  ha: "Hausa",
  ig: "Igbo",
};

export const normalizeLangName = (langCode: string): string => {
  if (!langCode) return "English";
  switch (langCode.toLowerCase()) {
    case "en":
    case "english":
      return "English";
    case "pcm":
    case "pidgin":
      return "Pidgin";
    case "yo":
    case "yoruba":
      return "Yoruba";
    case "ha":
    case "hausa":
      return "Hausa";
    case "ig":
    case "igbo":
      return "Igbo";
    default:
      return "English";
  }
};

const locales = Localization.getLocales();
const deviceLanguage = locales && locales.length > 0 ? locales[0].languageCode : "en";
const defaultLanguage = resources.hasOwnProperty(deviceLanguage || "en") ? (deviceLanguage || "en") : "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: "en",
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
