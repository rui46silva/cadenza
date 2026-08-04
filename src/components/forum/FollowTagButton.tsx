"use client";

import { useState } from "react";
import { Users, UserCheck } from "lucide-react";
import { event } from "@/lib/gtag";

export default function FollowTagButton({
  tagId,
  tagName,
  initialFollowing,
}: {
  tagId: string;
  tagName: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    await fetch(`/api/tags/${tagId}/follow`, { method: following ? "DELETE" : "POST" }).catch(
      () => null
    );
    setLoading(false);
    event(following ? "unfollow_tag" : "follow_tag", { tag: tagName });
    setFollowing((v) => !v);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={following ? `Deixar de seguir #${tagName}` : `Seguir #${tagName}`}
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${
        following
          ? "border-accent bg-accent/10 text-accent"
          : "border-black/15 dark:border-white/20 text-black/50 dark:text-white/50 hover:border-accent hover:text-accent"
      }`}
    >
      {following ? <UserCheck className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
      {following ? "A seguir" : "Seguir"}
    </button>
  );
}
