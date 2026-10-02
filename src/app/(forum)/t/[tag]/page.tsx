import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Hash } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PostListItem from "@/components/forum/PostListItem";

const CATEGORY_LABEL: Record<string, string> = {
  INSTRUMENT: "instrumento",
  GENRE: "género",
  LEVEL: "nível",
  OTHER: "tópico",
};

async function findTag(param: string) {
  const name = decodeURIComponent(param);
  return prisma.tag.findUnique({ where: { name } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = await findTag(raw);
  if (!tag) return { title: "Tópico não encontrado" };

  const kind = CATEGORY_LABEL[tag.category] ?? "tópico";
  const title = `${tag.name} — comunidade de ${kind} | Cadenza`;
  const description = `Posts, dúvidas e feedback sobre ${tag.name} na Cadenza, a comunidade de músicos. Junta-te a quem partilha o mesmo ${kind}.`;
  const canonical = `/t/${encodeURIComponent(tag.name)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = await findTag(raw);
  if (!tag) notFound();

  const session = await auth();
  const viewerId = session?.user?.id;

  const posts = await prisma.post.findMany({
    where: { tags: { some: { tagId: tag.id } } },
    orderBy: [{ sponsored: "desc" }, { score: "desc" }, { createdAt: "desc" }],
    take: 30,
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
  });

  const [votes, marks] =
    viewerId && posts.length > 0
      ? await Promise.all([
          prisma.postVote.findMany({
            where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true, value: true },
          }),
          prisma.bookmark.findMany({
            where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          }),
        ])
      : [[], []];
  const voteByPost = new Map(votes.map((v) => [v.postId, v.value]));
  const bookmarked = new Set(marks.map((m) => m.postId));

  const kind = CATEGORY_LABEL[tag.category] ?? "tópico";

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Hash className="h-6 w-6 text-accent" />
          {tag.name}
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Tudo o que a comunidade Cadenza partilha sobre {tag.name} ({kind}) — posts,
          dúvidas e pedidos de feedback.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="text-black/50 dark:text-white/50">
          Ainda não há posts sobre {tag.name}. Sê o primeiro a publicar!
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              currentUserId={viewerId}
              post={{
                ...post,
                viewerVote: voteByPost.get(post.id) ?? null,
                viewerBookmarked: bookmarked.has(post.id),
              }}
            />
          ))}
        </ul>
      )}

      <Link
        href={`/forum?tag=${encodeURIComponent(tag.name)}`}
        className="text-sm text-accent hover:underline"
      >
        Ver tudo sobre {tag.name} no fórum →
      </Link>
    </div>
  );
}
