"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

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
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    // Limpa já o campo para a UI responder de imediato; repõe se falhar.
    setContent("");
    setLoading(true);
    onPosted?.();

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setContent(text);
      toast(data?.error ?? "Não foi possível comentar.", "error");
      return;
    }

    toast(parentId ? "Resposta publicada" : "Comentário publicado");
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
        className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-accent text-accent-foreground px-3 py-1.5 text-sm shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "A enviar..." : parentId ? "Responder" : "Comentar"}
      </button>
    </form>
  );
}
