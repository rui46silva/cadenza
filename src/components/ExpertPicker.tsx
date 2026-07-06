"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import { roleLabel } from "@/components/RoleBadge";
import { useDismiss } from "@/lib/useDismiss";

export type Expert = {
  id: string;
  name: string;
  role: string;
  instrument: string | null;
  avatarUrl: string | null;
  verificationStatus?: string | null;
  isAmbassador?: boolean | null;
};

/**
 * Campo de sugestão para dirigir uma dúvida a um professor/profissional
 * verificado ou embaixador. Sugere nomes à medida que se escreve, dando
 * prioridade a quem toca o instrumento passado em `instrument`.
 */
export default function ExpertPicker({
  value,
  onChange,
  instrument,
}: {
  value: Expert | null;
  onChange: (expert: Expert | null) => void;
  instrument?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Expert[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(ref, () => setOpen(false), open);

  useEffect(() => {
    if (value) return;
    const controller = new AbortController();
    const handle = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (instrument) params.set("instrument", instrument);
      fetch(`/api/experts/search?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setResults(data?.experts ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [query, instrument, value]);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-sky-500/40 bg-sky-500/5 px-3 py-2">
        <Avatar name={value.name} avatarUrl={value.avatarUrl} size={28} />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-medium">{value.name}</span>
          <span className="truncate text-xs text-black/50 dark:text-white/50">
            {roleLabel(value)}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remover destinatário"
          className="ml-auto shrink-0 rounded-full p-1 hover:bg-sky-500/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-md border border-black/15 dark:border-white/20 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-black/40 dark:text-white/40" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Procurar professor ou profissional (opcional)..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
          {loading && results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-black/40 dark:text-white/40">
              A procurar...
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-black/40 dark:text-white/40">
              Nenhum especialista encontrado.
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((expert) => (
                <li key={expert.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(expert);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent/10"
                  >
                    <Avatar name={expert.name} avatarUrl={expert.avatarUrl} size={28} />
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">
                        {expert.name}
                      </span>
                      <span className="truncate text-xs text-black/50 dark:text-white/50">
                        {roleLabel(expert)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
