"use client";

import { useRef, useState } from "react";
import { useDismiss } from "@/lib/useDismiss";
import { dropdownPanel } from "@/lib/ui";
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

  useDismiss(ref, () => setOpen(false), open);

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
        <ul className={`absolute left-0 mt-1 w-44 max-w-[calc(100vw-2rem)] ${dropdownPanel}`}>
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
