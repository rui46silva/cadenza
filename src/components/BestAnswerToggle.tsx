"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

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
  const { toast } = useToast();
  // Estado otimista: assume que a alteração vai resultar e reverte se falhar.
  // Ressincroniza com o servidor quando a prop muda (ex: outro comentário fixado).
  const [pinned, setPinned] = useState(isBestAnswer);
  const [lastProp, setLastProp] = useState(isBestAnswer);
  if (isBestAnswer !== lastProp) {
    setLastProp(isBestAnswer);
    setPinned(isBestAnswer);
  }

  async function toggle() {
    const next = !pinned;
    setPinned(next);

    const res = await fetch(`/api/posts/${postId}/best-answer`, {
      method: next ? "PATCH" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: next ? JSON.stringify({ commentId }) : undefined,
    });

    if (!res.ok) {
      setPinned(!next);
      const data = await res.json().catch(() => null);
      toast(data?.error ?? "Não foi possível atualizar a resposta.", "error");
      return;
    }

    if (next) toast("Resposta fixada — quem respondeu ganhou pontos!");
    router.refresh();
  }

  if (!canManage && !pinned) return null;

  if (pinned) {
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
            className="text-black/40 dark:text-white/40 hover:underline"
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
      className="text-black/50 dark:text-white/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
    >
      Fixar resposta
    </button>
  );
}
