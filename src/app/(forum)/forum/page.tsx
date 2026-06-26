import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import ForumFilters from "@/components/forum/ForumFilters";
import ForumFeedList from "@/components/forum/ForumFeedList";
import { getForumFeed } from "@/lib/forumFeed";
import { SORT_OPTIONS, type SortOption } from "@/lib/forumSort";
import { isTagCategory } from "@/lib/tagCategories";

const FORUM_PAGE_SIZE = 10;

export const metadata: Metadata = {
  title: "Fórum",
  description:
    "Partilha o teu trabalho, pede opiniões e ajuda outros músicos a crescer no fórum Cadenza.",
  alternates: { canonical: "/forum" },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string; category?: string; sort?: string }>;
}) {
  const { tag, q, category, sort: sortParam } = await searchParams;
  const categoryFilter = category && isTagCategory(category) ? category : undefined;
  const sort: SortOption = (SORT_OPTIONS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortOption)
    : "recentes";

  const { posts, hasMore } = await getForumFeed({
    tag,
    q,
    category: categoryFilter,
    sort,
    skip: 0,
    take: FORUM_PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-bold">Fórum Cadenza</h1>
        <p className="text-black/60 dark:text-white/60">
          {q
            ? `Resultados para "${q}"`
            : "Partilha o teu trabalho, pede opiniões e ajuda outros músicos a crescer."}
        </p>
      </section>

      <ForumFilters category={categoryFilter} sort={sort} q={q} />

      <ForumFeedList
        initialPosts={posts}
        initialHasMore={hasMore}
        pageSize={FORUM_PAGE_SIZE}
        tag={tag}
        q={q}
        category={categoryFilter}
        sort={sort}
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED}
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
    </div>
  );
}
