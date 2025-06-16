"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Language, translations, TranslationKey } from "../lib/translations";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  
  const t = (key: TranslationKey, values?: Record<string, string | number>) => {
    let translation = translations[lang][key] || key;
    
    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        translation = translation.replace(
          new RegExp(`\\{${placeholder}\\}`, 'g'),
          value.toString()
        );
      });
    }
    
    return translation;
  };
  
  const isRTL = lang === "ar";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}