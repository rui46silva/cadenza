"use client";

import { useMemo, useState } from "react";
import { COMMON_INSTRUMENTS } from "@/lib/instruments";

export default function InstrumentInput({
  name,
  value,
  onChange,
  className,
  required,
  multiple = false,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  // Quando true, permite vários instrumentos separados por vírgula e as
  // sugestões acrescentam ao último em vez de substituir tudo.
  multiple?: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Em modo múltiplo, sugerimos com base no que vem depois da última vírgula.
  const currentTerm = multiple ? value.split(",").pop()?.trim() ?? "" : value.trim();

  const suggestions = useMemo(() => {
    const q = currentTerm.toLowerCase();
    if (!q) return COMMON_INSTRUMENTS.slice(0, 6);
    return COMMON_INSTRUMENTS.filter((i) => i.toLowerCase().includes(q)).slice(0, 6);
  }, [currentTerm]);

  function applySuggestion(s: string) {
    if (multiple) {
      const parts = value.split(",");
      parts[parts.length - 1] = ` ${s}`;
      // Deixa uma vírgula pronta para o próximo instrumento.
      onChange(parts.join(",").replace(/^\s+/, "") + ", ");
    } else {
      onChange(s);
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        required={required}
        placeholder={
          multiple
            ? "Que instrumentos tocas? (separa por vírgulas)"
            : "Que instrumento tocas? (ex: piano, saxofone)"
        }
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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySuggestion(s)}
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
