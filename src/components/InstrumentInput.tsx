"use client";

import { useMemo, useState } from "react";
import { COMMON_INSTRUMENTS } from "@/lib/instruments";

export default function InstrumentInput({
  name,
  value,
  onChange,
  className,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return COMMON_INSTRUMENTS.slice(0, 6);
    return COMMON_INSTRUMENTS.filter((i) => i.toLowerCase().includes(q)).slice(0, 6);
  }, [value]);

  return (
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        placeholder="Que instrumento tocas? (ex: piano, saxofone)"
        className={
          className ??
          "w-full rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        }
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center px-3 py-1.5 text-sm hover:bg-accent/10"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
