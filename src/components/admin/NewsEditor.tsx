"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import RichEditor from "@/components/admin/RichEditor";
import SeoEditor from "@/components/admin/SeoEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import { Panel, PublishPanel, RevisionsPanel, type PublishState } from "@/components/admin/EditorPanels";
import { useAutosave } from "@/components/admin/useAutosave";
import { toLocalInput, fromLocalInput, isFutureDate } from "@/lib/datetime";
import { markdownToText } from "@/lib/markdown";

export type NewsEditorArticle = {
  id: string;
  title: string;
  slug: string | null;
  summary: string;
  content: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  category: string | null;
  url: string | null;
  imageUrl: string | null;
  source: string | null;
  published: boolean;
  publishedAt: string;
};

type Form = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  metaDescription: string;
  focusKeyword: string;
  category: string;
  url: string;
  imageUrl: string;
  source: string;
  state: PublishState;
  publishAt: string;
};

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadenza.pt").replace(/^https?:\/\//, "");
const input = "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20";

function toForm(a: NewsEditorArticle | null): Form {
  return {
    title: a?.title ?? "",
    slug: a?.slug ?? "",
    summary: a?.summary ?? "",
    content: a?.content ?? "",
    metaDescription: a?.metaDescription ?? "",
    focusKeyword: a?.focusKeyword ?? "",
    category: a?.category ?? "",
    url: a?.url ?? "",
    imageUrl: a?.imageUrl ?? "",
    source: a?.source ?? "",
    state: a ? (a.published ? "published" : "draft") : "draft",
    publishAt: toLocalInput(a?.publishedAt ?? new Date()),
  };
}

export default function NewsEditor({
  article,
  categories,
}: {
  article: NewsEditorArticle | null;
  categories: string[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = !article;
  const [form, setForm] = useState<Form>(() => toForm(article));
  const [saved, setSaved] = useState<Form>(() => toForm(article));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [revKey, setRevKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const autosave = useAutosave(`news:${article?.id ?? "new"}`, form, dirty);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save(publish: boolean) {
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title,
      slug: form.slug,
      summary: form.summary,
      content: form.content,
      metaDescription: form.metaDescription,
      focusKeyword: form.focusKeyword,
      category: form.category,
      url: form.url,
      imageUrl: form.imageUrl,
      source: form.source,
      published: publish,
      publishedAt: fromLocalInput(form.publishAt),
    };
    const res = await fetch(isNew ? "/api/admin/news" : `/api/admin/news/${article!.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    if (!res.ok) {
      const fieldErrors = data?.details?.fieldErrors as Record<string, string[]> | undefined;
      const first = fieldErrors ? Object.entries(fieldErrors)[0] : null;
      setError(first ? `${first[0]}: ${first[1][0]}` : data?.error ?? "Não foi possível guardar.");
      return;
    }
    const a = data.article;
    const next: Form = { ...form, slug: a.slug ?? "", state: a.published ? "published" : "draft" };
    setForm(next);
    setSaved(next);
    setSavedAt(new Date());
    setRevKey((k) => k + 1);
    autosave.clear();
    toast(a.published ? (isFutureDate(a.publishedAt) ? "Notícia agendada" : "Notícia publicada") : "Rascunho guardado");
    if (isNew) router.replace(`/admin/conteudo/noticias/${a.id}`);
    else router.refresh();
  }

  async function remove() {
    await fetch(`/api/admin/news/${article!.id}`, { method: "DELETE" });
    autosave.clear();
    toast("Notícia eliminada");
    router.push("/admin/conteudo/noticias");
  }

  function restore(data: Record<string, unknown>) {
    setForm((f) => ({
      ...f,
      title: String(data.title ?? ""),
      slug: String(data.slug ?? ""),
      summary: String(data.summary ?? ""),
      content: String(data.content ?? ""),
      metaDescription: String(data.metaDescription ?? ""),
      focusKeyword: String(data.focusKeyword ?? ""),
      category: String(data.category ?? ""),
      url: String(data.url ?? ""),
      imageUrl: String(data.imageUrl ?? ""),
      source: String(data.source ?? ""),
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

        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Título da notícia"
          className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-black/25 dark:placeholder:text-white/25"
        />
        <div className="flex flex-wrap items-center gap-1 text-xs text-black/50 dark:text-white/50">
          <span>Ligação permanente: {SITE_HOST}/noticias/</span>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="gerado-a-partir-do-titulo"
            className="min-w-[180px] flex-1 rounded border border-black/10 bg-transparent px-1.5 py-0.5 dark:border-white/15"
          />
        </div>

        <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">
          Resumo (aparece no cartão da notícia)
          <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={2} maxLength={500} className={input} />
        </label>

        <RichEditor value={form.content} onChange={(v) => set("content", v)} placeholder="Escreve a notícia… usa a barra de ferramentas ou Markdown." />

        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>

      <aside className="flex flex-col gap-4">
        <PublishPanel
          supportsSchedule
          state={form.state}
          publishAt={form.publishAt}
          onPublishAtChange={(v) => set("publishAt", v)}
          onSave={save}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          dirty={dirty}
          savedAt={savedAt}
          isNew={isNew}
          viewHref={!isNew && saved.state === "published" ? `/noticias/${saved.slug || article!.id}` : null}
        />

        <Panel title="Categoria">
          <input list="news-categories" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="ex: Concursos, Entrevistas" className={input} />
          <datalist id="news-categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Panel>

        <Panel title="Imagem destacada">
          {form.imageUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="" className="aspect-video w-full rounded-md object-cover" />
              <button type="button" onClick={() => set("imageUrl", "")} aria-label="Remover imagem" className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"><X className="h-3 w-3" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => setPicker(true)} className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-black/20 text-xs text-black/50 hover:border-accent hover:text-accent dark:border-white/20 dark:text-white/50">
              <ImageIcon className="h-5 w-5" /> Escolher imagem
            </button>
          )}
        </Panel>

        <Panel title="Fonte externa (opcional)">
          <input value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="Nome da fonte (ex: Público)" className={input} />
          <input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="URL do artigo original" type="url" className={input} />
        </Panel>

        <SeoEditor
          title={form.title}
          onTitleChange={(v) => set("title", v)}
          metaDescription={form.metaDescription}
          onMetaChange={(v) => set("metaDescription", v)}
          focusKeyword={form.focusKeyword}
          onFocusKeywordChange={(v) => set("focusKeyword", v)}
          slug={form.slug}
          content={markdownToText(form.content) || form.summary}
          displayUrl={`${SITE_HOST}/noticias/${form.slug || "titulo-da-noticia"}`}
          editTitle={false}
          descPlaceholder={form.summary || "Meta-descrição SEO (~150 caracteres)"}
        />

        {!isNew && <RevisionsPanel entityType="news" entityId={article!.id} refreshKey={revKey} onRestore={restore} />}
      </aside>

      {picker && (
        <MediaPicker onClose={() => setPicker(false)} onSelect={(m) => { set("imageUrl", m.url); setPicker(false); }} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Eliminar notícia"
          description="Esta ação não pode ser desfeita."
          confirmLabel="Eliminar"
          onConfirm={remove}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
