import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersByRole,
    totalPosts,
    totalComments,
    totalVotes,
    viewsAgg,
    newUsers7d,
    newUsers30d,
    newPosts7d,
    pendingVerifications,
    activeBans,
    topTags,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.post.count(),
    prisma.comment.count({ where: { isDeleted: false } }),
    prisma.postVote.count(),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({
      where: { role: { in: ["PROFESSOR", "MUSICO_PROFISSIONAL"] }, verificationStatus: "PENDING" },
    }),
    prisma.ban.count({
      where: { liftedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    }),
    prisma.postTag.groupBy({
      by: ["tagId"],
      _count: { _all: true },
      orderBy: { _count: { tagId: "desc" } },
      take: 5,
    }),
  ]);

  // Série diária dos últimos 14 dias (novos utilizadores e posts).
  const fourteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
  fourteenDaysAgo.setHours(0, 0, 0, 0);
  const [recentUsers, recentPosts] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { createdAt: true } }),
    prisma.post.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { createdAt: true } }),
  ]);
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const daily: { date: string; users: number; posts: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    daily.push({ date: dayKey(d), users: 0, posts: 0 });
  }
  const byDay = new Map(daily.map((d) => [d.date, d]));
  for (const u of recentUsers) {
    const row = byDay.get(dayKey(u.createdAt));
    if (row) row.users++;
  }
  for (const p of recentPosts) {
    const row = byDay.get(dayKey(p.createdAt));
    if (row) row.posts++;
  }

  const tagNames = await prisma.tag.findMany({
    where: { id: { in: topTags.map((t) => t.tagId) } },
    select: { id: true, name: true },
  });
  const tagNameById = new Map(tagNames.map((t) => [t.id, t.name]));

  return {
    totalUsers,
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count._all])),
    totalPosts,
    totalComments,
    totalVotes,
    totalViews: viewsAgg._sum.views ?? 0,
    newUsers7d,
    newUsers30d,
    newPosts7d,
    pendingVerifications,
    activeBans,
    daily,
    topTags: topTags.map((t) => ({
      name: tagNameById.get(t.tagId) ?? "?",
      count: t._count._all,
    })),
  };
}
