import Link from "next/link";
import type { Metadata } from "next";
import { Trophy, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { currentChallenge } from "@/lib/challenges";
import { buttonPrimary } from "@/lib/ui";
import PostListItem from "@/components/forum/PostListItem";

export const metadata: Metadata = {
  title: "Desafio da semana",
  description: "O desafio semanal da comunidade Cadenza — participa e ganha o teu distintivo.",
  alternates: { canonical: "/desafios" },
};

export default async function DesafiosPage() {
  const session = await auth();
  const viewerId = session?.user?.id;
  const challenge = currentChallenge();

  const posts = await prisma.post.findMany({
    where: { challengeId: challenge.id },
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
      votes: true,
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const withScore = posts.map(({ votes, ...post }) => ({
    ...post,
    score: votes.reduce((acc, v) => acc + (v.value === "UP" ? 1 : -1), 0),
    viewerVote: viewerId ? votes.find((v) => v.userId === viewerId)?.value ?? null : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/10 to-transparent p-6">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
          <Trophy className="h-4 w-4" />
          Desafio da semana
        </span>
        <h1 className="mt-2 text-2xl font-bold">{challenge.title}</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">{challenge.prompt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {session?.user ? (
            <Link href="/posts/new?desafio=1" className={buttonPrimary}>
              Participar
            </Link>
          ) : (
            <Link href="/login" className={buttonPrimary}>
              Entra para participar
            </Link>
          )}
          <span className="flex items-center gap-1.5 text-sm text-black/50 dark:text-white/50">
            <Users className="h-4 w-4" />
            {withScore.length} participaç{withScore.length === 1 ? "ão" : "ões"}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Participações</h2>
        <ul className="flex flex-col gap-3">
          {withScore.length === 0 ? (
            <p className="text-black/50 dark:text-white/50">
              Ainda ninguém participou esta semana. Sê a primeira pessoa!
            </p>
          ) : (
            withScore.map((post) => (
              <PostListItem key={post.id} post={post} currentUserId={viewerId} />
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
