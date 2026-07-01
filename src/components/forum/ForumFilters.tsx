"use client";

import { useRouter, usePathname } from "next/navigation";
import type { TagCategory } from "@prisma/client";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/tagCategories";
import { SORT_OPTIONS, SORT_LABELS, type SortOption } from "@/lib/forumSort";
import FilterDropdown from "@/components/forum/FilterDropdown";

const categoryOptions = CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));
const sortOptions = SORT_OPTIONS.map((s) => ({ value: s, label: SORT_LABELS[s] }));

export default function ForumFilters({
  category,
  sort,
  q,
  following = false,
  showFollowingTab = false,
}: {
  category?: TagCategory;
  sort: SortOption;
  q?: string;
  following?: boolean;
  showFollowingTab?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(next: { category?: TagCategory; sort?: SortOption; following?: boolean }) {
    const nextCategory = "category" in next ? next.category : category;
    const nextSort = "sort" in next ? next.sort : sort;
    const nextFollowing = "following" in next ? next.following : following;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextCategory) params.set("category", nextCategory);
    if (nextSort && nextSort !== "recentes") params.set("sort", nextSort);
    if (nextFollowing) params.set("following", "1");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-3">
      {showFollowingTab && (
        <div className="flex gap-1 rounded-full border border-black/10 dark:border-white/10 p-1 self-start text-sm">
          <button
            type="button"
            onClick={() => navigate({ following: false })}
            className={`rounded-full px-3 py-1 transition-colors ${
              !following
                ? "bg-accent text-accent-foreground font-medium"
                : "text-black/60 dark:text-white/60 hover:text-accent"
            }`}
          >
            Tudo
          </button>
          <button
            type="button"
            onClick={() => navigate({ following: true })}
            className={`rounded-full px-3 py-1 transition-colors ${
              following
                ? "bg-accent text-accent-foreground font-medium"
                : "text-black/60 dark:text-white/60 hover:text-accent"
            }`}
          >
            Para ti
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <FilterDropdown
          label="Todos os grupos"
          value={category}
          options={categoryOptions}
          onChange={(c) => navigate({ category: c })}
        />
        <FilterDropdown
          label="Ordenar por"
          value={sort}
          options={sortOptions}
          onChange={(s) => navigate({ sort: s ?? "recentes" })}
          allowClear={false}
        />
      </div>
    </div>
  );
}
