"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { applyTheme, THEME_STORAGE_KEY, Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (value: Theme) => void;
};

const EVENT = "cadenza-theme-change";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
});

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    getSnapshot,
    () => "system"
  );

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (value: Theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
