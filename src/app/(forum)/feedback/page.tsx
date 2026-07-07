import Link from "next/link";
import type { Metadata } from "next";
import { Music, PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buttonPrimarySm, pill, pillActive } from "@/lib/ui";
import PostListItem from "@/components/forum/PostListItem";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Pede e dá feedback sobre vídeos de músicos da comunidade Cadenza — grava, partilha e evolui.",
  alternates: { canonical: "/feedback" },
};

const FILTERS = [
  { key: "abertos", label: "Por responder" },
  { key: "todos", label: "Todos" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filter: FilterKey = FILTERS.some((f) => f.key === estado)
    ? (estado as FilterKey)
    : "abertos";

  const session = await auth();
  const viewerId = session?.user?.id;

  const posts = await prisma.post.findMany({
    where: {
      feedbackRequest: true,
      ...(filter === "abertos" ? { comments: { none: {} } } : {}),
    },
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
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Music className="h-6 w-6 text-accent" />
            Feedback
          </h1>
          <p className="text-black/60 dark:text-white/60">
            Grava-te a tocar, diz em que queres ajuda e a comunidade dá-te
            feedback. É assim que se cresce.
          </p>
        </div>
        {session?.user && (
          <Link
            href="/posts/new?feedback=1"
            className={`${buttonPrimarySm} flex items-center gap-1.5 shrink-0`}
          >
            <PlusCircle className="h-4 w-4" />
            Pedir feedback
          </Link>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "abertos" ? "/feedback" : `/feedback?estado=${f.key}`}
            className={filter === f.key ? pillActive : pill}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {withScore.length === 0 ? (
          <p className="text-black/50 dark:text-white/50">
            {filter === "abertos"
              ? "Não há pedidos de feedback à espera. Bom trabalho!"
              : "Ainda não há pedidos de feedback. Sê a primeira pessoa a partilhar um vídeo!"}
          </p>
        ) : (
          withScore.map((post) => (
            <PostListItem key={post.id} post={post} currentUserId={viewerId} />
          ))
        )}
      </ul>
    </div>
  );
}
