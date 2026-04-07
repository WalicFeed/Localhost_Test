"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "ru";

type Translations = Record<string, string>;

const translations: Record<Language, Translations> = {
  en: {
    "register.title": "Sign Up",
    "register.description": "Enter your name and email to create an account",
    "register.name": "Name",
    "register.email": "Email",
    "register.submit": "Create Account",
    "register.loading": "Please wait…",
    "register.error": "Registration error",
    "register.networkError": "Network error",
  },
  ru: {
    "register.title": "Регистрация",
    "register.description": "Укажите имя и email для создания аккаунта",
    "register.name": "Имя",
    "register.email": "Email",
    "register.submit": "Зарегистрироваться",
    "register.loading": "Подождите…",
    "register.error": "Ошибка регистрации",
    "register.networkError": "Сетевая ошибка",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language | null;
    if (stored === "en" || stored === "ru") {
      setLanguageState(stored);
    }
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }

  function t(key: string): string {
    return translations[language][key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
