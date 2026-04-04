import React, { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/components/i18n/useTranslation";
import { ChevronDown } from "lucide-react";

export default function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return null;
}