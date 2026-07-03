import Link from "next/link";
import type { Metadata } from "next";
import { HelpCircle, PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import { buttonPrimarySm, pill, pillActive } from "@/lib/ui";
import PostListItem from "@/components/forum/PostListItem";

export const metadata: Metadata = {
  title: "Dúvidas",
  description:
    "Tira dúvidas diretamente com professores certificados e músicos profissionais verificados da comunidade Cadenza.",
  alternates: { canonical: "/duvidas" },
};

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "abertas", label: "Por responder" },
  { key: "resolvidas", label: "Resolvidas" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default async function DuvidasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filter: FilterKey = FILTERS.some((f) => f.key === estado)
    ? (estado as FilterKey)
    : "todas";

  const session = await auth();
  const viewerId = session?.user?.id;

  const questions = await prisma.post.findMany({
    where: {
      isQuestion: true,
      ...(filter === "abertas" ? { bestAnswerId: null } : {}),
      ...(filter === "resolvidas" ? { bestAnswerId: { not: null } } : {}),
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
      directedTo: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      votes: true,
      comments: {
        where: { isDeleted: false },
        select: { author: { select: { role: true, verificationStatus: true } } },
      },
      _count: { select: { comments: true } },
    },
    orderBy: [{ bestAnswerId: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
    take: 50,
  });

  const withStatus = questions.map(({ votes, comments, ...post }) => {
    const answeredByVerified = comments.some(
      (c) =>
        (VERIFIABLE_ROLES as readonly string[]).includes(c.author.role) &&
        c.author.verificationStatus === "APPROVED"
    );
    return {
      ...post,
      score: votes.reduce((acc, v) => acc + (v.value === "UP" ? 1 : -1), 0),
      viewerVote: viewerId
        ? votes.find((v) => v.userId === viewerId)?.value ?? null
        : null,
      questionStatus: post.bestAnswerId
        ? ("resolved" as const)
        : answeredByVerified
        ? ("answered" as const)
        : ("unanswered" as const),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <HelpCircle className="h-6 w-6 text-accent" />
            Dúvidas
          </h1>
          <p className="text-black/60 dark:text-white/60">
            Perguntas da comunidade respondidas por professores certificados e
            músicos profissionais verificados.
          </p>
        </div>
        {session?.user && (
          <Link
            href="/posts/new?duvida=1"
            className={`${buttonPrimarySm} flex items-center gap-1.5 shrink-0`}
          >
            <PlusCircle className="h-4 w-4" />
            Tirar dúvida
          </Link>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "todas" ? "/duvidas" : `/duvidas?estado=${f.key}`}
            className={filter === f.key ? pillActive : pill}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {withStatus.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            {filter === "abertas"
              ? "Não há dúvidas por responder. Bom trabalho!"
              : "Ainda não há dúvidas. Sê a primeira pessoa a perguntar!"}
          </p>
        )}
        {withStatus.map((post) => (
          <PostListItem key={post.id} post={post} currentUserId={viewerId} />
        ))}
      </ul>
    </div>
  );
}
