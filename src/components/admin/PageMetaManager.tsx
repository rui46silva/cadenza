"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimarySm } from "@/lib/ui";
import SeoEditor from "@/components/admin/SeoEditor";

export type ManagedPage = {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
  title: string;
  metaDescription: string;
  focusKeyword: string;
};

// Domínio mostrado na pré-visualização do Google.
const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadenza.pt").replace(/^https?:\/\//, "");

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
  const [focusKeyword, setFocusKeyword] = useState(page.focusKeyword);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const customized = Boolean(page.title || page.metaDescription || page.focusKeyword);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/page-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: page.path, title, metaDescription, focusKeyword }),
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
            {customized && <span className="text-[11px] text-accent">(personalizado)</span>}
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
        <div className="mt-3 flex flex-col gap-3 border-t border-black/10 dark:border-white/10 pt-3">
          <SeoEditor
            title={title}
            onTitleChange={setTitle}
            metaDescription={metaDescription}
            onMetaChange={setMetaDescription}
            focusKeyword={focusKeyword}
            onFocusKeywordChange={setFocusKeyword}
            displayUrl={`${SITE_HOST}${page.path}`}
            titlePlaceholder={page.defaultTitle}
            descPlaceholder={page.defaultDescription}
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
