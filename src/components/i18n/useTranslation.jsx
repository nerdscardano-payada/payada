import { useState, useCallback } from "react";
import { translations as baseTranslations } from "./translations";
import { extraTranslations } from "./translationsExtra";

const isPlainObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const mergeTranslations = (base, extra) => {
  const merged = { ...base };

  Object.entries(extra || {}).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(base?.[key])) {
      merged[key] = { ...base[key], ...value };
    } else {
      merged[key] = value;
    }
  });

  return merged;
};

// Merge extra translations into base
const translations = Object.fromEntries(
  Object.keys(baseTranslations).map((lang) => [
    lang,
    mergeTranslations(baseTranslations[lang], extraTranslations[lang] || {}),
  ])
);

const STORAGE_KEY = "payada_lang";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
    const browser = navigator.language?.slice(0, 2);
    if (browser && translations[browser]) return browser;
  } catch {}
  return "en";
}

export function useTranslation() {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
  }, []);

  const t = useCallback(
    (key) => {
      const keys = key.split(".");
      let value = translations[lang];
      for (const k of keys) value = value?.[k];
      if (value === undefined) {
        let fallback = translations["en"];
        for (const k of keys) fallback = fallback?.[k];
        return fallback ?? key;
      }
      return value;
    },
    [lang]
  );

  return { t, lang, setLang };
}