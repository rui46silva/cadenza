"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({
  postId,
  parentId,
  autoFocus,
  onPosted,
}: {
  postId: string;
  parentId?: string;
  autoFocus?: boolean;
  onPosted?: () => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível comentar.");
      return;
    }

    setContent("");
    onPosted?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          parentId ? "Escreve a tua resposta..." : "Deixa o teu comentário ou opinião..."
        }
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {loading ? "A enviar..." : parentId ? "Responder" : "Comentar"}
      </button>
    </form>
  );
}
