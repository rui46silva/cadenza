"use client";

import { useEffect, useState } from "react";
import { X, Plus, ImageIcon } from "lucide-react";

export type Media = { id: string; url: string; alt: string | null; title: string | null };

/**
 * Seletor da biblioteca de média: lista as imagens guardadas, permite
 * acrescentar uma nova por URL e devolve a escolhida em onSelect.
 */
export default function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (m: Media) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function add() {
    setError(null);
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "URL inválido.");
      return;
    }
    onSelect(data.item);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
          <h2 className="flex items-center gap-2 font-semibold"><ImageIcon className="h-4 w-4 text-accent" /> Biblioteca de média</h2>
          <button type="button" onClick={onClose} aria-label="Fechar"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-black/10 p-4 dark:border-white/10">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL da imagem (https://…)" className="min-w-[200px] flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20" />
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Texto alternativo (SEO/acessibilidade)" className="min-w-[160px] flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20" />
          <button type="button" onClick={add} disabled={!url} className="flex items-center gap-1 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50">
            <Plus className="h-4 w-4" /> Adicionar e inserir
          </button>
          {error && <p className="w-full text-xs text-rose-500">{error}</p>}
        </div>

        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4">
          {loading && <p className="col-span-full text-sm text-black/50 dark:text-white/50">A carregar…</p>}
          {!loading && items.length === 0 && (
            <p className="col-span-full text-sm text-black/50 dark:text-white/50">Ainda não há imagens. Adiciona uma por URL acima.</p>
          )}
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className="group overflow-hidden rounded-lg border border-black/10 text-left hover:border-accent dark:border-white/10"
              title={m.alt ?? m.url}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
              <span className="block truncate px-2 py-1 text-[11px] text-black/50 dark:text-white/50">{m.alt || "sem texto alt"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
