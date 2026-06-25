"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; icon: typeof Sun; title: string }[] = [
  { value: "light", icon: Sun, title: "Modo claro" },
  { value: "dark", icon: Moon, title: "Modo escuro" },
  { value: "system", icon: Monitor, title: "Seguir o sistema" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-black/15 dark:border-white/20 p-0.5">
      {OPTIONS.map(({ value, icon: Icon, title }) => (
        <button
          key={value}
          type="button"
          title={title}
          aria-label={title}
          onClick={() => setTheme(value)}
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
            theme === value
              ? "bg-accent text-accent-foreground"
              : "hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
