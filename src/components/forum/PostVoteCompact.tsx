"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function PostVoteCompact({
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

  async function vote(e: React.MouseEvent, value: "UP" | "DOWN") {
    e.preventDefault();
    e.stopPropagation();
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
      event("vote", { value, post_id: postId });
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 px-1 py-0.5">
      <button
        type="button"
        onClick={(e) => vote(e, "UP")}
        disabled={loading}
        aria-pressed={userVote === "UP"}
        aria-label="Gosto"
        className={`flex h-6 w-6 items-center justify-center rounded-full disabled:opacity-50 ${
          userVote === "UP" ? "text-accent" : "text-black/40 dark:text-white/40 hover:text-accent"
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" fill={userVote === "UP" ? "currentColor" : "none"} />
      </button>
      <span className="min-w-[1.5ch] text-center text-xs font-medium">{score}</span>
      <button
        type="button"
        onClick={(e) => vote(e, "DOWN")}
        disabled={loading}
        aria-pressed={userVote === "DOWN"}
        aria-label="Não gosto"
        className={`flex h-6 w-6 items-center justify-center rounded-full disabled:opacity-50 ${
          userVote === "DOWN" ? "text-rose-500" : "text-black/40 dark:text-white/40 hover:text-rose-500"
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" fill={userVote === "DOWN" ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
