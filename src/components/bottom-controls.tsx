"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useLanguage, type Language } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export function BottomControls() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-2 z-50">
      {/* Theme toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="h-9 w-9 rounded-full"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      {/* Language switcher */}
      <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
        {LANGUAGES.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            aria-pressed={language === code}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              language === code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
