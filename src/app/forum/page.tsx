import Link from "next/link";
import { prisma } from "@/lib/prisma";

const TYPE_ICON: Record<string, string> = { TEXT: "📝", VIDEO: "🎥" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  const [posts, topTags] = await Promise.all([
    prisma.post.findMany({
      where: tag ? { tags: { some: { tag: { name: tag } } } } : undefined,
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
          Partilha o teu trabalho, pede opiniões e ajuda outros músicos a crescer.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/forum"
          className={`rounded-full px-3 py-1 text-xs border ${
            !tag ? "bg-black text-white dark:bg-white dark:text-black" : "border-black/15 dark:border-white/20"
          }`}
        >
          Todos
        </Link>
        {topTags.map((t) => (
          <Link
            key={t.id}
            href={`/forum?tag=${encodeURIComponent(t.name)}`}
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
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
          >
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
        ))}
      </ul>
    </div>
  );
}
