import { Fragment } from "react";
import Link from "next/link";
import { FileText, Video, Pin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdSlot from "@/components/AdSlot";
import Avatar from "@/components/Avatar";
import TagCategoryRow from "@/components/TagCategoryRow";
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
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, votes: true } },
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
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
          <TagCategoryRow
            key={group.category}
            label={group.label}
            tags={group.tags}
            activeTag={tag}
            q={q}
          />
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
            <li className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-accent/60 transition-colors flex flex-col gap-1">
              <Link href={`/posts/${post.id}`} className="flex items-center gap-2 font-medium">
                <Icon className="h-4 w-4 text-accent shrink-0" />
                {post.title}
                {post.pinned && <Pin className="h-3.5 w-3.5 text-accent shrink-0" />}
              </Link>
              <span className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50">
                <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size={16} />
                por{" "}
                <Link
                  href={`/perfil/${post.author.id}`}
                  className="hover:text-accent hover:underline"
                >
                  {post.author.name}
                </Link>{" "}
                · {post._count.comments} comentários · {post._count.votes} votos
              </span>
              {post.tags.length > 0 && (
                <span className="flex gap-1 flex-wrap mt-1">
                  {post.tags.map(({ tag }) => (
                    <Link
                      key={tag.id}
                      href={`/forum?tag=${encodeURIComponent(tag.name)}`}
                      className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs hover:bg-accent/15 hover:text-accent"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </span>
              )}
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
