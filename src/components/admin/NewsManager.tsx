"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimarySm } from "@/lib/ui";
import ConfirmDialog from "@/components/ConfirmDialog";

export type NewsArticleData = {
  id: string;
  title: string;
  slug: string | null;
  summary: string;
  content: string | null;
  metaDescription: string | null;
  url: string | null;
  imageUrl: string | null;
  source: string | null;
  published: boolean;
  publishedAt: string | Date;
};

const inputClass =
  "rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm";

export default function NewsManager({ articles }: { articles: NewsArticleData[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, summary, metaDescription, content, url, imageUrl, source }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar a notícia.");
      return;
    }
    setTitle("");
    setSlug("");
    setSummary("");
    setMetaDescription("");
    setContent("");
    setUrl("");
    setImageUrl("");
    setSource("");
    router.refresh();
  }

  async function togglePublished(id: string, published: boolean) {
    setPendingId(id);
    await fetch(`/api/admin/news/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setPendingId(null);
    router.refresh();
  }

  async function remove(id: string) {
    setPendingId(id);
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    setPendingId(null);
    setConfirmDeleteId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-lg">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          required
          className={inputClass}
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug do URL (opcional — gerado a partir do título)"
          className={inputClass}
        />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Resumo (aparece no cartão da notícia)"
          required
          rows={2}
          className={inputClass}
        />
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Meta-descrição SEO (Google/redes sociais, ~150 caracteres)"
          rows={2}
          maxLength={300}
          className={inputClass}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Corpo do artigo (opcional — separa parágrafos com linha em branco)"
          rows={6}
          className={inputClass}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL da fonte externa (opcional)"
            type="url"
            className={inputClass}
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL da imagem (opcional)"
            type="url"
            className={inputClass}
          />
        </div>
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Fonte (opcional, ex: Público)"
          className={inputClass}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className={`${buttonPrimarySm} self-start`}>
          {loading ? "A publicar..." : "Publicar notícia"}
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {articles.length === 0 && (
          <p className="text-black/50 dark:text-white/50">Ainda não há notícias.</p>
        )}
        {articles.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-black/10 dark:border-white/10 p-3 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-medium text-sm">
                  {a.title}{" "}
                  {!a.published && (
                    <span className="text-xs text-black/40 dark:text-white/40">(rascunho)</span>
                  )}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  /noticias/{a.slug ?? a.id} ·{" "}
                  {new Date(a.publishedAt).toLocaleDateString("pt-PT")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === a.id ? null : a.id)}
                  className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent"
                >
                  {editingId === a.id ? "Fechar" : "Editar"}
                </button>
                <button
                  type="button"
                  onClick={() => togglePublished(a.id, a.published)}
                  disabled={pendingId === a.id}
                  className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {a.published ? "Despublicar" : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(a.id)}
                  disabled={pendingId === a.id}
                  className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-rose-500 hover:text-rose-500 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
            {editingId === a.id && (
              <EditArticle
                article={a}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            )}
          </li>
        ))}
      </ul>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Eliminar notícia"
          description="Esta ação não pode ser desfeita."
          confirmLabel="Eliminar"
          loading={pendingId === confirmDeleteId}
          onConfirm={() => remove(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

function EditArticle({
  article,
  onSaved,
}: {
  article: NewsArticleData;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug ?? "");
  const [summary, setSummary] = useState(article.summary);
  const [metaDescription, setMetaDescription] = useState(article.metaDescription ?? "");
  const [content, setContent] = useState(article.content ?? "");
  const [url, setUrl] = useState(article.url ?? "");
  const [imageUrl, setImageUrl] = useState(article.imageUrl ?? "");
  const [source, setSource] = useState(article.source ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/news/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, summary, metaDescription, content, url, imageUrl, source }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível guardar.");
      return;
    }
    onSaved();
  }

  return (
    <div className="flex flex-col gap-2 border-t border-black/10 dark:border-white/10 pt-3">
      <label className="text-xs text-black/50 dark:text-white/50">Título</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      <label className="text-xs text-black/50 dark:text-white/50">Slug (URL)</label>
      <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
      <label className="text-xs text-black/50 dark:text-white/50">Resumo</label>
      <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={inputClass} />
      <label className="text-xs text-black/50 dark:text-white/50">Meta-descrição SEO</label>
      <textarea
        value={metaDescription}
        onChange={(e) => setMetaDescription(e.target.value)}
        rows={2}
        maxLength={300}
        className={inputClass}
      />
      <label className="text-xs text-black/50 dark:text-white/50">Corpo do artigo</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className={inputClass} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL fonte" type="url" className={inputClass} />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL imagem" type="url" className={inputClass} />
      </div>
      <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Fonte" className={inputClass} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="button" onClick={save} disabled={saving} className={`${buttonPrimarySm} self-start`}>
        {saving ? "A guardar..." : "Guardar alterações"}
      </button>
    </div>
  );
}
