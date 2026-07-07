import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Inbox, Music, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import PostListItem, { type PostListItemData } from "@/components/forum/PostListItem";

export const metadata: Metadata = {
  title: "Responder a dúvidas",
  description: "Fila de dúvidas por responder para professores e profissionais verificados.",
};

function Section({
  icon: IconCmp,
  title,
  empty,
  posts,
  viewerId,
}: {
  icon: typeof Inbox;
  title: string;
  empty: string;
  posts: PostListItemData[];
  viewerId?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 font-semibold">
        <IconCmp className="h-4 w-4 text-accent" />
        {title}
        <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs font-medium text-black/50 dark:text-white/50">
          {posts.length}
        </span>
      </h2>
      {posts.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} currentUserId={viewerId} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function ResponderDuvidasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, verificationStatus: true, instrument: true },
  });

  const isVerifiedPro =
    me &&
    (VERIFIABLE_ROLES as readonly string[]).includes(me.role) &&
    me.verificationStatus === "APPROVED";

  if (!isVerifiedPro) redirect("/duvidas");

  const open = await prisma.post.findMany({
    where: { isQuestion: true, bestAnswerId: null },
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
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const instrument = me.instrument?.trim().toLowerCase();
  const withScore = open.map(({ votes, ...post }) => ({
    ...post,
    score: votes.reduce((acc, v) => acc + (v.value === "UP" ? 1 : -1), 0),
    viewerVote:
      votes.find((v) => v.userId === session.user.id)?.value ?? null,
    questionStatus: "unanswered" as const,
  }));

  const directed = withScore.filter((p) => p.directedTo?.id === session.user.id);
  const directedIds = new Set(directed.map((p) => p.id));
  const myInstrument = withScore.filter(
    (p) =>
      !directedIds.has(p.id) &&
      instrument &&
      p.tags.some(({ tag }) => tag.name.toLowerCase() === instrument)
  );
  const coveredIds = new Set([...directedIds, ...myInstrument.map((p) => p.id)]);
  const others = withScore.filter(
    (p) => !coveredIds.has(p.id) && p.author.id !== session.user.id
  );

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Inbox className="h-6 w-6 text-accent" />
          Responder a dúvidas
        </h1>
        <p className="text-black/60 dark:text-white/60">
          A tua fila enquanto conta verificada — respostas fixadas pelos alunos
          valem 15 pontos.
        </p>
      </section>

      <Section
        icon={Inbox}
        title="Dirigidas a ti"
        empty="Nenhuma dúvida dirigida a ti por responder. 🎉"
        posts={directed}
        viewerId={session.user.id}
      />
      <Section
        icon={Music}
        title={me.instrument ? `Do teu instrumento (${me.instrument})` : "Do teu instrumento"}
        empty={
          me.instrument
            ? "Não há dúvidas do teu instrumento por responder."
            : "Define o teu instrumento no perfil para veres dúvidas da tua área."
        }
        posts={myInstrument}
        viewerId={session.user.id}
      />
      <Section
        icon={HelpCircle}
        title="Outras dúvidas em aberto"
        empty="Não há mais dúvidas em aberto."
        posts={others}
        viewerId={session.user.id}
      />
    </div>
  );
}
