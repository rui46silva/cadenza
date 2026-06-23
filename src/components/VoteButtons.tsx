"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VoteButtons({
  postId,
  initialScore,
}: {
  postId: string;
  initialScore: number;
}) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [loading, setLoading] = useState(false);

  async function vote(value: "UP" | "DOWN") {
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    setLoading(false);
    if (res.ok) {
      setScore((s) => s + (value === "UP" ? 1 : -1));
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => vote("UP")}
        disabled={loading}
        className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Votar a favor"
      >
        ▲
      </button>
      <span className="text-sm font-medium">{score}</span>
      <button
        onClick={() => vote("DOWN")}
        disabled={loading}
        className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Votar contra"
      >
        ▼
      </button>
    </div>
  );
}
