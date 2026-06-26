"use client";

import { useRouter, usePathname } from "next/navigation";
import type { TagCategory } from "@prisma/client";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/tagCategories";

export const SORT_OPTIONS = ["recentes", "votados", "comentados"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

const SORT_LABELS: Record<SortOption, string> = {
  recentes: "Mais recentes",
  votados: "Mais votados",
  comentados: "Mais comentados",
};

const selectClass =
  "rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-1.5 text-sm";

export default function ForumFilters({
  category,
  sort,
  q,
}: {
  category?: TagCategory;
  sort: SortOption;
  q?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(next: { category?: string; sort?: string }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const nextCategory = next.category ?? category;
    const nextSort = next.sort ?? sort;
    if (nextCategory) params.set("category", nextCategory);
    if (nextSort && nextSort !== "recentes") params.set("sort", nextSort);
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={category ?? ""}
        onChange={(e) => navigate({ category: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">Todos os grupos</option>
        {CATEGORY_ORDER.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => navigate({ sort: e.target.value })}
        className={selectClass}
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {SORT_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
