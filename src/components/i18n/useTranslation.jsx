import { useCallback } from "react";
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

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function useTranslation() {
  const lang = "en";

  const setLang = useCallback(() => {}, []);

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