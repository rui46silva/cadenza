"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TagCategory } from "@prisma/client";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/tagCategories";

export type TagData = {
  id: string;
  name: string;
  category: TagCategory;
  postCount: number;
};

export default function TagCategoryManager({ tags }: { tags: TagData[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function updateCategory(id: string, category: TagCategory) {
    setPendingId(id);
    await fetch(`/api/admin/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    setPendingId(null);
    router.refresh();
  }

  return (
    <ul className="flex flex-col gap-2">
      {tags.length === 0 && (
        <p className="text-black/50 dark:text-white/50">Ainda não há tópicos.</p>
      )}
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-black/10 dark:border-white/10 p-3 flex-wrap"
        >
          <span className="text-sm">
            #{tag.name}{" "}
            <span className="text-xs text-black/40 dark:text-white/40">
              ({tag.postCount} posts)
            </span>
          </span>
          <select
            value={tag.category}
            onChange={(e) => updateCategory(tag.id, e.target.value as TagCategory)}
            disabled={pendingId === tag.id}
            className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1 text-xs bg-transparent disabled:opacity-50"
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
