import type { Metadata } from "next";
import AdSlot from "@/components/AdSlot";
import ChallengeBanner from "@/components/forum/ChallengeBanner";
import PostComposer from "@/components/forum/PostComposer";
import ForumFilters from "@/components/forum/ForumFilters";
import ForumFeedList from "@/components/forum/ForumFeedList";
import PremiumPromo from "@/components/PremiumPromo";
import { getForumFeed } from "@/lib/forumFeed";
import { getMostPopularPostId } from "@/lib/popular";
import { SORT_OPTIONS, type SortOption } from "@/lib/forumSort";
import { isTagCategory } from "@/lib/tagCategories";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/pageMeta";

const FORUM_PAGE_SIZE = 10;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/forum", {
    title: "Fórum",
    description:
      "Partilha o teu trabalho, pede opiniões e ajuda outros músicos a crescer no fórum Cadenza.",
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    tag?: string;
    q?: string;
    category?: string;
    sort?: string;
    following?: string;
  }>;
}) {
  const { tag, q, category, sort: sortParam, following } = await searchParams;
  const categoryFilter = category && isTagCategory(category) ? category : undefined;
  const sort: SortOption = (SORT_OPTIONS as readonly string[]).includes(sortParam ?? "")
    ? (sortParam as SortOption)
    : "recentes";

  const session = await auth();
  const viewer = session?.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, avatarUrl: true, isPremium: true },
      })
    : null;
  const hasFollows = session?.user
    ? (await prisma.tagFollow.count({ where: { userId: session.user.id } })) > 0
    : false;
  const followingOnly = following === "1" && hasFollows;
  const followingUserId = followingOnly ? session?.user?.id : undefined;

  const { posts, hasMore } = await getForumFeed({
    tag,
    q,
    category: categoryFilter,
    sort,
    followingUserId,
    viewerId: session?.user?.id,
    skip: 0,
    take: FORUM_PAGE_SIZE,
  });

  // Destaca o post mais popular do fórum (o mais votado de todos) sempre que
  // ele apareça nesta lista, fora de pesquisas.
  const mostPopular = q ? null : await getMostPopularPostId();
  const highlightId = mostPopular?.id;

  return (
    <div className="flex flex-col gap-4">
      {q ? (
        <section>
          <h1 className="text-2xl font-bold">Resultados</h1>
          <p className="text-black/60 dark:text-white/60">
            Para &ldquo;{q}&rdquo;
          </p>
        </section>
      ) : (
        <>
          {viewer && <PostComposer name={viewer.name} avatarUrl={viewer.avatarUrl} />}
          <ChallengeBanner />
        </>
      )}

      <ForumFilters
        category={categoryFilter}
        sort={sort}
        q={q}
        following={followingOnly}
        showFollowingTab={hasFollows}
      />

      <ForumFeedList
        key={`${tag ?? ""}-${q ?? ""}-${categoryFilter ?? ""}-${sort}-${followingOnly}`}
        initialPosts={posts}
        initialHasMore={hasMore}
        pageSize={FORUM_PAGE_SIZE}
        tag={tag}
        q={q}
        category={categoryFilter}
        sort={sort}
        following={followingOnly}
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED}
        currentUserId={session?.user?.id}
        mostPopularId={highlightId}
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />

      {/* Promo do Premium — só para quem ainda não é Premium e nunca em pesquisas. */}
      {!q && !viewer?.isPremium && <PremiumPromo />}
    </div>
  );
}
