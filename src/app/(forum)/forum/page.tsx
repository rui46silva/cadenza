import { Fragment } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdSlot from "@/components/AdSlot";

const TYPE_ICON: Record<string, string> = { TEXT: "📝", VIDEO: "🎥" };

// Após quantos posts aparece o anúncio intercalado no feed.
const FEED_AD_AFTER = 4;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const { tag, q } = await searchParams;

  const [posts, topTags] = await Promise.all([
    prisma.post.findMany({
      where: {
        ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        author: { select: { name: true, role: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: "desc" } },
      take: 12,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-bold">Fórum Cadenza</h1>
        <p className="text-black/60 dark:text-white/60">
          {q
            ? `Resultados para "${q}"`
            : "Partilha o teu trabalho, pede opiniões e ajuda outros músicos a crescer."}
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href={q ? `/forum?q=${encodeURIComponent(q)}` : "/forum"}
          className={`rounded-full px-3 py-1 text-xs border ${
            !tag ? "bg-black text-white dark:bg-white dark:text-black" : "border-black/15 dark:border-white/20"
          }`}
        >
          Todos
        </Link>
        {topTags.map((t) => (
          <Link
            key={t.id}
            href={`/forum?tag=${encodeURIComponent(t.name)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs border ${
              tag === t.name
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border-black/15 dark:border-white/20"
            }`}
          >
            #{t.name} ({t._count.posts})
          </Link>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Ainda não há posts. Sê o primeiro a partilhar algo!
          </p>
        )}
        {posts.map((post, index) => (
          <Fragment key={post.id}>
            <li className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors">
              <Link href={`/posts/${post.id}`} className="flex flex-col gap-1">
                <span className="font-medium">
                  {TYPE_ICON[post.type]} {post.title}
                </span>
                <span className="text-xs text-black/50 dark:text-white/50">
                  por {post.author.name} ·{" "}
                  {post._count.comments} comentários · {post._count.votes} votos
                </span>
                {post.tags.length > 0 && (
                  <span className="flex gap-1 flex-wrap mt-1">
                    {post.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </span>
                )}
              </Link>
            </li>
            {index === FEED_AD_AFTER - 1 && (
              <li>
                <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED} />
              </li>
            )}
          </Fragment>
        ))}
      </ul>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
    </div>
  );
}
