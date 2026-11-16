"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import RichEditor from "@/components/admin/RichEditor";
import SeoEditor from "@/components/admin/SeoEditor";
import { PublishPanel, RevisionsPanel, type PublishState } from "@/components/admin/EditorPanels";
import { useAutosave } from "@/components/admin/useAutosave";
import { markdownToText } from "@/lib/markdown";

export type PageEditorPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string | null;
  focusKeyword: string | null;
  published: boolean;
};

type Form = { title: string; slug: string; content: string; metaDescription: string; focusKeyword: string; state: PublishState };

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadenza.pt").replace(/^https?:\/\//, "");

function toForm(p: PageEditorPage | null): Form {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    content: p?.content ?? "",
    metaDescription: p?.metaDescription ?? "",
    focusKeyword: p?.focusKeyword ?? "",
    state: p?.published ? "published" : "draft",
  };
}

export default function PageEditor({ page }: { page: PageEditorPage | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = !page;
  const [form, setForm] = useState<Form>(() => toForm(page));
  const [saved, setSaved] = useState<Form>(() => toForm(page));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [revKey, setRevKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const autosave = useAutosave(`page:${page?.id ?? "new"}`, form, dirty);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save(publish: boolean) {
    setSaving(true);
    setError(null);
    const { state: _state, ...rest } = form;
    void _state;
    const res = await fetch(isNew ? "/api/admin/pages" : `/api/admin/pages/${page!.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rest, published: publish }),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    if (!res.ok) {
      const fieldErrors = data?.details?.fieldErrors as Record<string, string[]> | undefined;
      const first = fieldErrors ? Object.entries(fieldErrors)[0] : null;
      setError(first ? `${first[0]}: ${first[1][0]}` : data?.error ?? "Não foi possível guardar.");
      return;
    }
    const p = data.page;
    const next: Form = { ...form, slug: p.slug, state: p.published ? "published" : "draft" };
    setForm(next);
    setSaved(next);
    setSavedAt(new Date());
    setRevKey((k) => k + 1);
    autosave.clear();
    toast(p.published ? "Página publicada" : "Rascunho guardado");
    if (isNew) router.replace(`/admin/conteudo/paginas/${p.id}`);
    else router.refresh();
  }

  async function remove() {
    await fetch(`/api/admin/pages/${page!.id}`, { method: "DELETE" });
    autosave.clear();
    toast("Página eliminada");
    router.push("/admin/conteudo/paginas");
  }

  function restore(d: Record<string, unknown>) {
    setForm((f) => ({
      ...f,
      title: String(d.title ?? ""),
      slug: String(d.slug ?? ""),
      content: String(d.content ?? ""),
      metaDescription: String(d.metaDescription ?? ""),
      focusKeyword: String(d.focusKeyword ?? ""),
    }));
    toast("Versão restaurada — guarda para aplicar");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        {autosave.recovered && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            <span>Há um rascunho não guardado de {new Date(autosave.recovered.savedAt).toLocaleString("pt-PT")}.</span>
            <span className="flex gap-2">
              <button type="button" className="font-medium text-accent hover:underline" onClick={() => { setForm(autosave.recovered!.value); autosave.dismissRecovered(); }}>Recuperar</button>
              <button type="button" className="text-black/50 hover:underline dark:text-white/50" onClick={autosave.clear}>Descartar</button>
            </span>
          </div>
        )}
        <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Título da página" className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-black/25 dark:placeholder:text-white/25" />
        <div className="flex flex-wrap items-center gap-1 text-xs text-black/50 dark:text-white/50">
          <span>Ligação permanente: {SITE_HOST}/p/</span>
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="gerado-a-partir-do-titulo" className="min-w-[180px] flex-1 rounded border border-black/10 bg-transparent px-1.5 py-0.5 dark:border-white/15" />
        </div>
        <RichEditor value={form.content} onChange={(v) => set("content", v)} rows={20} />
        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>

      <aside className="flex flex-col gap-4">
        <PublishPanel
          state={form.state}
          onSave={save}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          dirty={dirty}
          savedAt={savedAt}
          isNew={isNew}
          viewHref={!isNew && saved.state === "published" ? `/p/${saved.slug}` : null}
        />
        <SeoEditor
          title={form.title}
          onTitleChange={(v) => set("title", v)}
          metaDescription={form.metaDescription}
          onMetaChange={(v) => set("metaDescription", v)}
          focusKeyword={form.focusKeyword}
          onFocusKeywordChange={(v) => set("focusKeyword", v)}
          slug={form.slug}
          content={markdownToText(form.content)}
          displayUrl={`${SITE_HOST}/p/${form.slug || "titulo-da-pagina"}`}
          editTitle={false}
          descPlaceholder="Meta-descrição SEO (~150 caracteres)"
        />
        {!isNew && <RevisionsPanel entityType="page" entityId={page!.id} refreshKey={revKey} onRestore={restore} />}
      </aside>

      {confirmDelete && (
        <ConfirmDialog title="Eliminar página" description="Esta ação não pode ser desfeita." confirmLabel="Eliminar" onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
      )}
    </div>
  );
}
