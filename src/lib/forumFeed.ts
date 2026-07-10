import { prisma } from "@/lib/prisma";
import type { Prisma, TagCategory } from "@prisma/client";
import type { SortOption } from "@/lib/forumSort";

export async function getForumFeed({
  tag,
  q,
  category,
  sort,
  followingUserId,
  viewerId,
  skip = 0,
  take = 10,
}: {
  tag?: string;
  q?: string;
  category?: TagCategory;
  sort: SortOption;
  followingUserId?: string;
  viewerId?: string;
  skip?: number;
  take?: number;
}) {
  const where: Prisma.PostWhereInput = {
    AND: [
      tag ? { tags: { some: { tag: { name: tag } } } } : {},
      category ? { tags: { some: { tag: { category } } } } : {},
      followingUserId
        ? { tags: { some: { tag: { followers: { some: { userId: followingUserId } } } } } }
        : {},
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  // Ordenação feita na base de dados (usa os índices e a coluna score
  // desnormalizada) — sem carregar todos os posts para memória.
  const orderBy: Prisma.PostOrderByWithRelationInput[] =
    sort === "votados"
      ? [{ pinned: "desc" }, { score: "desc" }, { createdAt: "desc" }]
      : sort === "comentados"
      ? [{ pinned: "desc" }, { comments: { _count: "desc" } }, { createdAt: "desc" }]
      : [{ pinned: "desc" }, { createdAt: "desc" }];

  // Pede um a mais do que a página para saber se há mais sem uma 2ª contagem.
  const rows = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true,
          verificationStatus: true,
          isAmbassador: true,
        },
      },
      tags: { include: { tag: true } },
      _count: { select: { comments: true } },
    },
    orderBy,
    skip,
    take: take + 1,
  });

  const hasMore = rows.length > take;
  const page = rows.slice(0, take);

  // Voto do próprio utilizador apenas para os posts desta página.
  const viewerVotes = new Map<string, "UP" | "DOWN">();
  if (viewerId && page.length > 0) {
    const votes = await prisma.postVote.findMany({
      where: { userId: viewerId, postId: { in: page.map((p) => p.id) } },
      select: { postId: true, value: true },
    });
    for (const v of votes) viewerVotes.set(v.postId, v.value);
  }

  const withVote = page.map((post) => ({
    ...post,
    viewerVote: viewerVotes.get(post.id) ?? null,
  }));

  const withFollowStatus = await attachPrimaryTagFollowStatus(withVote, viewerId);

  return { posts: withFollowStatus, hasMore };
}

async function attachPrimaryTagFollowStatus<
  T extends { tags: { tag: { id: string; name: string } }[] },
>(posts: T[], viewerId?: string) {
  if (!viewerId) {
    return posts.map((post) => ({ ...post, primaryTagFollowed: false }));
  }

  const primaryTagIds = Array.from(
    new Set(posts.map((p) => p.tags[0]?.tag.id).filter((id): id is string => Boolean(id)))
  );

  const follows =
    primaryTagIds.length > 0
      ? await prisma.tagFollow.findMany({
          where: { userId: viewerId, tagId: { in: primaryTagIds } },
          select: { tagId: true },
        })
      : [];
  const followedIds = new Set(follows.map((f) => f.tagId));

  return posts.map((post) => ({
    ...post,
    primaryTagFollowed: post.tags[0] ? followedIds.has(post.tags[0].tag.id) : false,
  }));
}

export type ForumFeedPost = Awaited<ReturnType<typeof getForumFeed>>["posts"][number];
