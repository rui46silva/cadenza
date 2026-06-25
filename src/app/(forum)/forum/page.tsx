import { Fragment } from "react";
import Link from "next/link";
import { FileText, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdSlot from "@/components/AdSlot";
import Avatar from "@/components/Avatar";
import { groupTagsByCategory, isTagCategory } from "@/lib/tagCategories";
import { pill, pillActive } from "@/lib/ui";

const TYPE_ICON: Record<string, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
};

// Após quantos posts aparece o anúncio intercalado no feed.
const FEED_AD_AFTER = 4;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string; category?: string }>;
}) {
  const { tag, q, category } = await searchParams;
  const categoryFilter = category && isTagCategory(category) ? category : undefined;

  const [posts, topTags] = await Promise.all([
    prisma.post.findMany({
      where: {
        AND: [
          tag ? { tags: { some: { tag: { name: tag } } } } : {},
          categoryFilter
            ? { tags: { some: { tag: { category: categoryFilter } } } }
            : {},
          q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { content: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      include: {
        author: { select: { name: true, role: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: "desc" } },
      take: 40,
    }),
  ]);

  const tagGroups = groupTagsByCategory(topTags);

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

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={q ? `/forum?q=${encodeURIComponent(q)}` : "/forum"}
            className={!tag ? pillActive : pill}
          >
            Todos
          </Link>
        </div>
        {tagGroups.map((group) => (
          <div key={group.category} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-black/40 dark:text-white/40 shrink-0">
              {group.label}:
            </span>
            {group.tags.map((t) => (
              <Link
                key={t.id}
                href={`/forum?tag=${encodeURIComponent(t.name)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={tag === t.name ? pillActive : pill}
              >
                #{t.name} ({t._count.posts})
              </Link>
            ))}
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Ainda não há posts. Sê o primeiro a partilhar algo!
          </p>
        )}
        {posts.map((post, index) => {
          const Icon = TYPE_ICON[post.type];
          return (
          <Fragment key={post.id}>
            <li className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-accent/60 transition-colors">
              <Link href={`/posts/${post.id}`} className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 text-accent shrink-0" />
                  {post.title}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
                  <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size={16} />
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
          );
        })}
      </ul>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} />
    </div>
  );
}
