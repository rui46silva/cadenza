"use client";

import { useState } from "react";

export default function VoteButtons({
  postId,
  initialScore,
  initialUserVote,
}: {
  postId: string;
  initialScore: number;
  initialUserVote: "UP" | "DOWN" | null;
}) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  async function vote(value: "UP" | "DOWN") {
    if (loading) return;
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setScore(data.score);
      setUserVote(data.userVote);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => vote("UP")}
        disabled={loading}
        aria-pressed={userVote === "UP"}
        className={`rounded-md border px-2 py-1 text-sm transition-colors disabled:opacity-50 ${
          userVote === "UP"
            ? "border-accent bg-accent/10 text-accent"
            : "border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
        }`}
        aria-label="Votar a favor"
      >
        ▲
      </button>
      <span className="text-sm font-medium">{score}</span>
      <button
        onClick={() => vote("DOWN")}
        disabled={loading}
        aria-pressed={userVote === "DOWN"}
        className={`rounded-md border px-2 py-1 text-sm transition-colors disabled:opacity-50 ${
          userVote === "DOWN"
            ? "border-rose-500 bg-rose-500/10 text-rose-500"
            : "border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
        }`}
        aria-label="Votar contra"
      >
        ▼
      </button>
    </div>
  );
}
