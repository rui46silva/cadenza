"use client";

import { useState } from "react";
import Link from "next/link";
import { pill, pillActive } from "@/lib/ui";

const PREVIEW_COUNT = 8;

type TagWithCount = { id: string; name: string; _count: { posts: number } };

export default function TagCategoryRow({
  label,
  tags,
  activeTag,
  q,
}: {
  label: string;
  tags: TagWithCount[];
  activeTag?: string;
  q?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleTags = expanded ? tags : tags.slice(0, PREVIEW_COUNT);
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-black/40 dark:text-white/40 shrink-0">
        {label}:
      </span>
      {visibleTags.map((t) => (
        <Link
          key={t.id}
          href={`/forum?tag=${encodeURIComponent(t.name)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={activeTag === t.name ? pillActive : pill}
        >
          #{t.name} ({t._count.posts})
        </Link>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-accent hover:underline"
        >
          +{hiddenCount} mais
        </button>
      )}
      {expanded && tags.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-black/40 dark:text-white/40 hover:underline"
        >
          ver menos
        </button>
      )}
    </div>
  );
}
