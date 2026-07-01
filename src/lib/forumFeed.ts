import { prisma } from "@/lib/prisma";
import type { TagCategory } from "@prisma/client";
import type { SortOption } from "@/lib/forumSort";

const MAX_CANDIDATES = 200;

export async function getForumFeed({
  tag,
  q,
  category,
  sort,
  followingUserId,
  skip = 0,
  take = 10,
}: {
  tag?: string;
  q?: string;
  category?: TagCategory;
  sort: SortOption;
  followingUserId?: string;
  skip?: number;
  take?: number;
}) {
  const posts = await prisma.post.findMany({
    where: {
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
    },
    include: {
      author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      tags: { include: { tag: true } },
      votes: true,
      _count: { select: { comments: true, votes: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: MAX_CANDIDATES,
  });

  const ranked = posts
    .map(({ votes, ...post }) => ({
      ...post,
      score: votes.reduce((acc, v) => acc + (v.value === "UP" ? 1 : -1), 0),
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === "votados") return b.score - a.score;
      if (sort === "comentados") return b._count.comments - a._count.comments;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const page = ranked.slice(skip, skip + take);
  const hasMore = skip + take < ranked.length;

  return { posts: page, hasMore };
}

export type ForumFeedPost = Awaited<ReturnType<typeof getForumFeed>>["posts"][number];
