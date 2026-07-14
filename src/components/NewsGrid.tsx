"use client";

import { useState } from "react";
import Link from "next/link";
import { card } from "@/lib/ui";
import { formatRelativeTime } from "@/lib/time";

export type NewsCard = {
  id: string;
  slug: string | null;
  title: string;
  summary: string | null;
  imageUrl: string | null;
  source: string | null;
  publishedAt: string;
};

const INITIAL = 4;

export default function NewsGrid({ articles }: { articles: NewsCard[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? articles : articles.slice(0, INITIAL);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((a) => (
          <Link
            key={a.id}
            href={`/noticias/${a.slug ?? a.id}`}
            className={`${card} flex flex-col gap-2`}
          >
            {a.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.imageUrl} alt="" className="mb-1 h-36 w-full rounded-md object-cover" />
            )}
            <span className="font-semibold">{a.title}</span>
            <span className="text-sm text-black/60 dark:text-white/60">{a.summary}</span>
            <span className="flex items-center gap-1 text-xs text-black/40 dark:text-white/40">
              {a.source ?? "Cadenza"} · {formatRelativeTime(new Date(a.publishedAt))}
            </span>
          </Link>
        ))}
      </div>
      {articles.length > INITIAL && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-center rounded-full border border-black/15 dark:border-white/20 px-5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          {expanded ? "Ver menos" : `Ver mais (${articles.length - INITIAL})`}
        </button>
      )}
    </div>
  );
}
