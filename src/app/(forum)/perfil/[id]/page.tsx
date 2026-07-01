import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import InstagramIcon from "@/components/InstagramIcon";
import LevelBadge from "@/components/LevelBadge";
import { getUserBadges } from "@/lib/badges";

const TYPE_ICON: Record<string, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
};

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
      _count: { select: { posts: true, comments: true } },
    },
  });

  if (!user) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: { _count: { select: { comments: true, votes: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const badges = getUserBadges({
    postCount: user._count.posts,
    commentCount: user._count.comments,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
    longestStreak: user.longestStreak,
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center gap-4">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size={56} />
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-2">
            <RoleBadge user={user} />
            <LevelBadge points={user.points} />
          </div>
        </div>
        {user.instagramHandle && (
          <a
            href={`https://instagram.com/${user.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
          >
            <InstagramIcon className="h-4 w-4" />
            @{user.instagramHandle}
          </a>
        )}
      </section>

      {user.bio && (
        <p className="text-black/70 dark:text-white/70">{user.bio}</p>
      )}

      {badges.length > 0 && (
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
      )}

      <div className="flex gap-4 text-sm text-black/60 dark:text-white/60">
        <span>{user._count.posts} posts</span>
        <span>{user._count.comments} comentários</span>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Posts recentes</h2>
        <ul className="flex flex-col gap-3">
          {posts.length === 0 && (
            <p className="text-black/50 dark:text-white/50">
              Ainda não publicou nenhum post.
            </p>
          )}
          {posts.map((post) => {
            const Icon = TYPE_ICON[post.type];
            return (
              <li
                key={post.id}
                className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-accent/60 transition-colors"
              >
                <Link href={`/posts/${post.id}`} className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 text-accent shrink-0" />
                    {post.title}
                  </span>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {post._count.comments} comentários · {post._count.votes} votos
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
