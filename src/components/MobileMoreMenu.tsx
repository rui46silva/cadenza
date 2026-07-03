"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreVertical, Palette } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CookiePreferencesButton from "@/components/CookiePreferencesButton";

export default function MobileMoreMenu({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mais opções"
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black p-2 shadow-md flex flex-col gap-1 text-sm">
          {children}
          <div className="flex items-center justify-between rounded-md px-2 py-1.5">
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent" />
              Tema
            </span>
            <ThemeToggle />
          </div>
          <CookiePreferencesButton className="flex items-center rounded-md px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10">
            Preferências de cookies
          </CookiePreferencesButton>
        </div>
      )}
    </div>
  );
}
