"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tag = { id: string; name: string };

export default function FollowedTagsManager({
  allTags,
  initialFollowedIds,
}: {
  allTags: Tag[];
  initialFollowedIds: string[];
}) {
  const router = useRouter();
  const [followedIds, setFollowedIds] = useState(new Set(initialFollowedIds));
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggle(tagId: string) {
    const isFollowing = followedIds.has(tagId);
    setPendingId(tagId);
    await fetch(`/api/tags/${tagId}/follow`, { method: isFollowing ? "DELETE" : "POST" }).catch(
      () => null
    );
    setPendingId(null);
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const active = followedIds.has(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            disabled={pendingId === tag.id}
            className={`rounded-full px-3 py-1 text-xs transition-colors disabled:opacity-50 ${
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "border border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
            }`}
          >
            #{tag.name}
          </button>
        );
      })}
    </div>
  );
}
