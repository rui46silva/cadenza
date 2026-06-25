"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/tagCategories";

export default function CategoryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
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

  const label = value ? CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] : "Categorias";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
          value
            ? "border-accent text-accent bg-accent/10"
            : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
        }`}
      >
        {label}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
          <li>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent/10 ${
                !value ? "text-accent font-medium" : ""
              }`}
            >
              Todas categorias
            </button>
          </li>
          {CATEGORY_ORDER.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent/10 ${
                  value === c ? "text-accent font-medium" : ""
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
