"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin } from "lucide-react";

export default function PinToggle({
  postId,
  pinned,
}: {
  postId: string;
  pinned: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/posts/${postId}/pin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50 ${
        pinned
          ? "border-accent text-accent bg-accent/10"
          : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
      }`}
    >
      <Pin className="h-3.5 w-3.5" />
      {pinned ? "Fixado" : "Fixar post"}
    </button>
  );
}
