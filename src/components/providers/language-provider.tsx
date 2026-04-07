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
    "register.haveAccount": "Already have an account?",
    "register.loginLink": "Log in",
    "login.title": "Log In",
    "login.description": "Enter your email to sign in to your account",
    "login.email": "Email",
    "login.submit": "Log In",
    "login.loading": "Please wait…",
    "login.error": "Login error",
    "login.networkError": "Network error",
    "login.noAccount": "Don't have an account?",
    "login.registerLink": "Sign up",
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
    "register.haveAccount": "Уже есть аккаунт?",
    "register.loginLink": "Войти",
    "login.title": "Вход",
    "login.description": "Введите email для входа в аккаунт",
    "login.email": "Email",
    "login.submit": "Войти",
    "login.loading": "Подождите…",
    "login.error": "Ошибка входа",
    "login.networkError": "Сетевая ошибка",
    "login.noAccount": "Нет аккаунта?",
    "login.registerLink": "Зарегистрироваться",
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
