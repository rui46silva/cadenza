"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Media } from "@/components/admin/MediaPicker";

const input = "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20";

export default function MediaLibrary() {
  const { toast } = useToast();
  const [items, setItems] = useState<Media[] | null>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [selected, setSelected] = useState<Media | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/media");
    const data = await res.json().catch(() => null);
    setItems(data?.items ?? []);
  }
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setItems(d?.items ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, alt }) });
    const data = await res.json().catch(() => null);
    if (!res.ok) return toast(data?.error ?? "Não foi possível adicionar.", "error");
    setUrl(""); setAlt("");
    toast("Imagem adicionada");
    load();
  }

  async function saveSelected() {
    if (!selected) return;
    const res = await fetch(`/api/admin/media/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt: selected.alt ?? "", title: selected.title ?? "" }) });
    if (!res.ok) return toast("Não foi possível guardar.", "error");
    toast("Guardado");
    load();
  }

  async function remove() {
    if (!selected) return;
    await fetch(`/api/admin/media/${selected.id}`, { method: "DELETE" });
    setConfirm(false);
    setSelected(null);
    toast("Imagem removida da biblioteca");
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-4">
        <form onSubmit={add} className="flex flex-wrap gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… URL da imagem" type="url" required className={`${input} min-w-[220px] flex-1`} />
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Texto alternativo" className={`${input} min-w-[160px] flex-1`} />
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">Adicionar</button>
        </form>
        {items === null ? (
          <p className="text-sm text-black/50 dark:text-white/50">A carregar…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50">A biblioteca está vazia.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((m) => (
              <button key={m.id} type="button" onClick={() => setSelected({ ...m })} className={`overflow-hidden rounded-lg border-2 ${selected?.id === m.id ? "border-accent" : "border-transparent"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt ?? ""} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <aside className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 text-sm dark:border-white/10">
        {selected ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.url} alt={selected.alt ?? ""} className="w-full rounded-md" />
            <button type="button" onClick={() => { navigator.clipboard.writeText(selected.url); toast("URL copiado"); }} className="flex items-center gap-1 break-all text-left text-xs text-black/50 hover:text-accent dark:text-white/50"><Copy className="h-3 w-3 shrink-0" />{selected.url}</button>
            <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">Título<input value={selected.title ?? ""} onChange={(e) => setSelected({ ...selected, title: e.target.value })} className={input} /></label>
            <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">Texto alternativo<input value={selected.alt ?? ""} onChange={(e) => setSelected({ ...selected, alt: e.target.value })} className={input} /></label>
            <div className="flex justify-between">
              <button type="button" onClick={() => setConfirm(true)} className="flex items-center gap-1 text-rose-500 hover:underline"><Trash2 className="h-4 w-4" />Remover</button>
              <button type="button" onClick={saveSelected} className="rounded-md bg-accent px-3 py-1.5 font-medium text-accent-foreground">Guardar</button>
            </div>
          </>
        ) : (
          <p className="text-black/50 dark:text-white/50">Seleciona uma imagem para ver detalhes.</p>
        )}
      </aside>
      {confirm && <ConfirmDialog title="Remover imagem?" description="Remove da biblioteca (o URL original não é apagado)." confirmLabel="Remover" onConfirm={remove} onCancel={() => setConfirm(false)} />}
    </div>
  );
}
