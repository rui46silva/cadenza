"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

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
    <div ref={ref} className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 top-full z-10 bg-black/30"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-full z-20 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-black/10 dark:border-white/10 bg-white dark:bg-black p-4 shadow-lg">
            <div className="flex flex-col gap-5">{children}</div>
          </div>
        </>
      )}
    </div>
  );
}
