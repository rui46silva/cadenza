"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { event } from "@/lib/gtag";

export default function BookmarkButton({
  postId,
  initialBookmarked,
}: {
  postId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const next = !bookmarked;
    // Otimista.
    setBookmarked(next);
    const res = await fetch(`/api/posts/${postId}/bookmark`, {
      method: next ? "POST" : "DELETE",
    }).catch(() => null);
    setLoading(false);
    if (!res || !res.ok) {
      setBookmarked(!next); // reverte em caso de erro
      return;
    }
    event(next ? "bookmark_add" : "bookmark_remove", { post_id: postId });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={bookmarked}
      title={bookmarked ? "Remover dos guardados" : "Guardar"}
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
        bookmarked
          ? "border-accent bg-accent/10 text-accent"
          : "border-black/15 dark:border-white/20 text-black/50 dark:text-white/50 hover:border-accent hover:text-accent"
      }`}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-3.5 w-3.5" />
      ) : (
        <Bookmark className="h-3.5 w-3.5" />
      )}
      {bookmarked ? "Guardado" : "Guardar"}
    </button>
  );
}
