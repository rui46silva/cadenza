"use client";

import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; title: string }[] = [
  { value: "light", label: "☀️", title: "Modo claro" },
  { value: "dark", label: "🌙", title: "Modo escuro" },
  { value: "system", label: "🖥️", title: "Seguir o sistema" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-black/15 dark:border-white/20 p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.title}
          aria-label={option.title}
          onClick={() => setTheme(option.value)}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${
            theme === option.value
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
