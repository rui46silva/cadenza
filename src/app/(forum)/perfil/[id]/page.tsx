import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Flame, MessageSquare, FileText, Star, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import InstagramIcon from "@/components/InstagramIcon";
import LevelBadge from "@/components/LevelBadge";
import PostListItem from "@/components/forum/PostListItem";
import { getUserBadges } from "@/lib/badges";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, instrument: true, bio: true },
  });

  if (!user) return { title: "Perfil não encontrado" };

  const description =
    user.bio?.slice(0, 160) ??
    `Perfil de ${user.name}${user.instrument ? `, ${user.instrument}` : ""} na comunidade Cadenza.`;

  return {
    title: user.name,
    description,
    alternates: { canonical: `/perfil/${id}` },
    openGraph: { title: user.name, description, url: `/perfil/${id}` },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      instrument: true,
      verificationStatus: true,
      avatarUrl: true,
      bio: true,
      instagramHandle: true,
      createdAt: true,
      points: true,
      longestStreak: true,
      isAmbassador: true,
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      tags: { include: { tag: true } },
      votes: true,
      _count: { select: { comments: true, votes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const postsWithScore = posts.map(({ votes, ...post }) => ({
    ...post,
    score: votes.reduce((acc, v) => acc + (v.value === "UP" ? 1 : -1), 0),
  }));

  const badges = getUserBadges({
    postCount: user._count.posts,
    commentCount: user._count.comments,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
    longestStreak: user.longestStreak,
  });

  const memberSince = user.createdAt.toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });

  const stats = [
    { icon: FileText, label: "Posts", value: user._count.posts },
    { icon: MessageSquare, label: "Comentários", value: user._count.comments },
    { icon: Star, label: "Pontos", value: user.points },
    { icon: Flame, label: "Melhor sequência", value: `${user.longestStreak} dias` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/10 p-5 sm:flex-row sm:items-start">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size={72} />
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold">{user.name}</h1>
            {user.instagramHandle && (
              <a
                href={`https://instagram.com/${user.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                <InstagramIcon className="h-4 w-4" />
                @{user.instagramHandle}
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge user={user} />
            <LevelBadge points={user.points} />
            <span className="flex items-center gap-1 text-xs text-black/40 dark:text-white/40">
              <CalendarDays className="h-3.5 w-3.5" />
              Membro desde {memberSince}
            </span>
          </div>
          {user.bio && (
            <p className="rounded-lg bg-black/5 dark:bg-white/5 p-3 text-sm text-black/70 dark:text-white/70">
              {user.bio}
            </p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 rounded-lg border border-black/10 dark:border-white/10 p-3 text-center"
          >
            <s.icon className="h-4 w-4 text-accent" />
            <span className="text-lg font-bold">{s.value}</span>
            <span className="text-xs text-black/50 dark:text-white/50">{s.label}</span>
          </div>
        ))}
      </section>

      {badges.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Conquistas</h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.id}
                className="flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-medium"
              >
                <b.icon className="h-3.5 w-3.5" />
                {b.label}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Posts recentes</h2>
        <ul className="flex flex-col gap-3">
          {postsWithScore.length === 0 && (
            <p className="text-black/50 dark:text-white/50">
              Ainda não publicou nenhum post.
            </p>
          )}
          {postsWithScore.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </ul>
      </section>
    </div>
  );
}
