"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin } from "lucide-react";

export default function BestAnswerToggle({
  postId,
  commentId,
  isBestAnswer,
  canManage,
}: {
  postId: string;
  commentId: string;
  isBestAnswer: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/posts/${postId}/best-answer`, {
      method: isBestAnswer ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: isBestAnswer ? undefined : JSON.stringify({ commentId }),
    });
    setLoading(false);
    router.refresh();
  }

  if (!canManage && !isBestAnswer) return null;

  if (isBestAnswer) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
          <Pin className="h-3.5 w-3.5" />
          Resposta fixada
        </span>
        {canManage && (
          <button
            type="button"
            onClick={toggle}
            disabled={loading}
            className="text-black/40 dark:text-white/40 hover:underline disabled:opacity-50"
          >
            Remover
          </button>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="text-black/50 dark:text-white/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline disabled:opacity-50"
    >
      Fixar resposta
    </button>
  );
}
