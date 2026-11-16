"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Guarda automaticamente o rascunho do formulário no browser (localStorage)
 * enquanto se escreve, e avisa antes de sair com alterações por guardar.
 * Devolve um rascunho recuperável, se existir um mais recente que o guardado.
 */
export function useAutosave<T>(key: string, value: T, dirty: boolean) {
  const storageKey = `cadenza-cms-draft:${key}`;
  const [recovered, setRecovered] = useState<{ value: T; savedAt: number } | null>(null);
  const [lastLocalSave, setLastLocalSave] = useState<number | null>(null);
  const first = useRef(true);

  // Na primeira renderização, procura um rascunho local.
  useEffect(() => {
    // Lido fora do corpo do efeito (localStorage é um sistema externo).
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { value: T; savedAt: number };
          if (JSON.stringify(parsed.value) !== JSON.stringify(value)) setRecovered(parsed);
        }
      } catch {
        /* ignora */
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Guarda (com atraso) sempre que há alterações.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        const savedAt = Date.now();
        localStorage.setItem(storageKey, JSON.stringify({ value, savedAt }));
        setLastLocalSave(savedAt);
      } catch {
        /* ignora */
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [storageKey, value, dirty]);

  // Aviso ao sair com alterações por guardar.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function clear() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignora */
    }
    setRecovered(null);
  }

  return { recovered, dismissRecovered: () => setRecovered(null), clear, lastLocalSave };
}
