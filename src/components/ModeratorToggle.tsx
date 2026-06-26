"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModeratorToggle({
  userId,
  isModerator,
}: {
  userId: string;
  isModerator: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: isModerator ? "ALUNO" : "MODERATOR" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`rounded-full border px-3 py-1 text-xs disabled:opacity-50 ${
        isModerator
          ? "border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-500/10"
          : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
      }`}
    >
      {isModerator ? "Remover moderador" : "Tornar moderador"}
    </button>
  );
}
