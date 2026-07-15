"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimarySm } from "@/lib/ui";

export type ManagedPage = {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
  title: string;
  metaDescription: string;
};

const inputClass =
  "w-full rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm";

export default function PageMetaManager({ pages }: { pages: ManagedPage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {pages.map((page) => (
        <PageRow key={page.path} page={page} />
      ))}
    </div>
  );
}

function PageRow({ page }: { page: ManagedPage }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [metaDescription, setMetaDescription] = useState(page.metaDescription);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const customized = Boolean(page.title || page.metaDescription);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/page-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: page.path, title, metaDescription }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm">
            {page.label}{" "}
            {customized && (
              <span className="text-[11px] text-accent">(personalizado)</span>
            )}
          </p>
          <p className="truncate text-xs text-black/50 dark:text-white/50">{page.path}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent"
        >
          {open ? "Fechar" : "Editar SEO"}
        </button>
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-2 border-t border-black/10 dark:border-white/10 pt-3">
          <label className="text-xs text-black/50 dark:text-white/50">
            Título da página (deixa vazio para o padrão)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={page.defaultTitle}
            className={inputClass}
          />
          <label className="text-xs text-black/50 dark:text-white/50">
            Meta-descrição SEO (deixa vazio para o padrão)
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={page.defaultDescription}
            rows={3}
            maxLength={300}
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <button type="button" onClick={save} disabled={saving} className={buttonPrimarySm}>
              {saving ? "A guardar..." : "Guardar"}
            </button>
            {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400">Guardado ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
