import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Video, Pin, Eye, CheckCircle2, HelpCircle, Music, Flame } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CommentForm from "@/components/CommentForm";
import CommentItem, { CommentNode } from "@/components/CommentItem";
import VoteButtons from "@/components/VoteButtons";
import UserBadges from "@/components/UserBadges";
import { roleLabel } from "@/components/RoleBadge";
import AdSlot from "@/components/AdSlot";
import Avatar from "@/components/Avatar";
import PinToggle from "@/components/PinToggle";
import DeletePostButton from "@/components/DeletePostButton";
import ReportPostButton from "@/components/ReportPostButton";
import { isStaff } from "@/lib/moderation";
import { formatRelativeTime } from "@/lib/time";
import { getVideoEmbedUrl } from "@/lib/video";
import { getMostPopularPostId } from "@/lib/popular";
import { ESCALATION_DAYS } from "@/lib/escalateQuestions";

function buildCommentTree(
  comments: {
    id: string;
    content: string;
    isDeleted: boolean;
    parentId: string | null;
    authorId: string;
    author: {
      name: string;
      role: string;
      instrument: string | null;
      gender: string | null;
      verificationStatus: string | null;
      isAmbassador: boolean;
    };
  }[]
): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  for (const c of comments) {
    byId.set(c.id, { ...c, children: [] });
  }

  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Prioriza respostas de embaixadores no topo de cada nível, mantendo a
  // ordem cronológica (sort é estável) dentro de cada grupo.
  function byAmbassadorFirst(a: CommentNode, b: CommentNode) {
    return Number(b.author.isAmbassador) - Number(a.author.isAmbassador);
  }
  for (const node of byId.values()) {
    node.children.sort(byAmbassadorFirst);
  }
  roots.sort(byAmbassadorFirst);

  return roots;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true, content: true, author: { select: { name: true } } },
  });

  if (!post) return { title: "Post não encontrado" };

  const description = post.content
    ? post.content.slice(0, 160)
    : `Publicação de ${post.author.name} no fórum Cadenza.`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${id}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/posts/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          instrument: true,
          gender: true,
          verificationStatus: true,
          avatarUrl: true,
          isAmbassador: true,
        },
      },
      directedTo: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      votes: true,
      comments: {
        include: {
          author: {
            select: {
              name: true,
              role: true,
              instrument: true,
              gender: true,
              verificationStatus: true,
              isAmbassador: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) notFound();

  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });

  const score = post.votes.reduce(
    (acc, v) => acc + (v.value === "UP" ? 1 : -1),
    0
  );
  const currentUserVote = session?.user
    ? post.votes.find((v) => v.userId === session.user.id)?.value ?? null
    : null;

  // É este o post mais popular do fórum? Comparado com todos os posts.
  const mostPopular = await getMostPopularPostId();
  const isMostPopular = mostPopular?.id === post.id;

  const commentTree = buildCommentTree(post.comments);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: post.content ?? undefined,
    url: `${siteUrl}/posts/${post.id}`,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author.name },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: post.comments.filter((c) => !c.isDeleted).length,
      },
    ],
  };

  return (
    <article
      className={`flex flex-col gap-5 ${
        isMostPopular
          ? "rounded-2xl border-2 border-orange-500/40 bg-gradient-to-b from-orange-500/[0.06] to-transparent p-4 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.05)]"
          : ""
      }`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {isMostPopular && (
        <div className="-mx-4 -mt-4 flex items-center gap-4 rounded-t-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-white sm:-mx-6 sm:-mt-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
            <Flame className="h-6 w-6" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
              🔥 Em destaque
            </span>
            <span className="text-lg font-bold">Post mais popular do fórum</span>
            <span className="text-xs text-white/85">
              O post com mais votos da comunidade neste momento.
            </span>
          </div>
          <span className="flex shrink-0 flex-col items-center rounded-xl bg-white/15 px-3 py-1.5 ring-1 ring-white/30">
            <span className="text-xl font-bold tabular-nums">{score}</span>
            <span className="text-[10px] uppercase tracking-wide text-white/80">votos</span>
          </span>
        </div>
      )}

      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {post.type === "VIDEO" ? (
            <Video className="h-5 w-5 text-accent shrink-0" />
          ) : (
            <FileText className="h-5 w-5 text-accent shrink-0" />
          )}
          {post.title}
          {post.pinned && <Pin className="h-4 w-4 text-accent shrink-0" />}
          {post.isQuestion && (
            <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
              <HelpCircle className="h-3.5 w-3.5" />
              Dúvida
            </span>
          )}
          {post.feedbackRequest && (
            <span className="flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400">
              <Music className="h-3.5 w-3.5" />
              Pedido de feedback
            </span>
          )}
          {post.bestAnswerId && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {post.isQuestion ? "Resolvida" : "Resolvido"}
            </span>
          )}
        </h1>
        {post.feedbackRequest && post.feedbackFocus && (
          <p className="rounded-md bg-fuchsia-500/10 px-3 py-2 text-sm text-fuchsia-700 dark:text-fuchsia-300">
            <span className="font-medium">Feedback pedido:</span> {post.feedbackFocus}
          </p>
        )}
        {post.directedTo && (
          <p className="text-sm text-black/50 dark:text-white/50">
            Dúvida dirigida a{" "}
            <Link
              href={`/perfil/${post.directedTo.id}`}
              className="font-medium text-accent hover:underline"
            >
              {post.directedTo.name}
            </Link>
            {!post.bestAnswerId && (
              <span className="text-black/40 dark:text-white/40">
                {" "}
                · se não responder em {ESCALATION_DAYS} dias, abre à comunidade
              </span>
            )}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href={`/perfil/${post.author.id}`} className="flex items-center gap-1.5 hover:underline">
            <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} />
            <span className="text-black/50 dark:text-white/50">por {post.author.name}</span>
            <UserBadges user={post.author} />
          </Link>
          <span className="text-black/40 dark:text-white/40">· {roleLabel(post.author)}</span>
          <span className="text-black/40 dark:text-white/40">
            {formatRelativeTime(post.createdAt)}
          </span>
          <span className="flex items-center gap-1 text-black/40 dark:text-white/40">
            <Eye className="h-3.5 w-3.5" />
            {post.views + 1}
          </span>
          {session?.user && session.user.id !== post.author.id && (
            <ReportPostButton postId={post.id} />
          )}
          {isStaff(session?.user?.role) && (
            <>
              <PinToggle postId={post.id} pinned={post.pinned} />
              <DeletePostButton postId={post.id} />
            </>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {post.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.type === "VIDEO" && post.videoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <iframe
            src={getVideoEmbedUrl(post.videoUrl)}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}
      {post.content && (
        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
      )}

      {session?.user && (
        <VoteButtons postId={post.id} initialScore={score} initialUserVote={currentUserVote} />
      )}

      <section id="comentarios" className="flex flex-col gap-4 mt-2 scroll-mt-20">
        <h2 className="font-semibold">
          Comentários ({post.comments.filter((c) => !c.isDeleted).length})
        </h2>

        {session?.user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-black/50 dark:text-white/50">
            Entra na tua conta para comentar.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              postId={post.id}
              postAuthorId={post.author.id}
              bestAnswerId={post.bestAnswerId}
              comment={comment}
              currentUserId={session?.user?.id}
              currentUserRole={session?.user?.role}
            />
          ))}
        </ul>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
    </article>
  );
}
