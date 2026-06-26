"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  allowClear = true,
}: {
  label: string;
  value?: T;
  options: { value: T; label: string }[];
  onChange: (value: T | undefined) => void;
  allowClear?: boolean;
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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
          selected
            ? "border-accent text-accent bg-accent/10"
            : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
        }`}
      >
        {selected ? selected.label : label}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="absolute left-0 z-10 mt-1 w-44 overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
          {allowClear && (
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent/10 ${
                  !value ? "text-accent font-medium" : ""
                }`}
              >
                {label}
              </button>
            </li>
          )}
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent/10 ${
                  value === o.value ? "text-accent font-medium" : ""
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
