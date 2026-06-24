import Link from "next/link";
import { Flame, FileText, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";

const TYPE_ICON: Record<string, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
};

export default async function PopularPage() {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { name: true, role: true } },
      tags: { include: { tag: true } },
      votes: true,
      _count: { select: { comments: true, votes: true } },
    },
    take: 50,
  });

  const ranked = posts
    .map((post) => ({
      ...post,
      score: post.votes.reduce(
        (acc, v) => acc + (v.value === "UP" ? 1 : -1),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Flame className="h-6 w-6 text-accent" />
          Popular
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Os posts com mais votos no fórum.
        </p>
      </section>

      <ul className="flex flex-col gap-3">
        {ranked.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Ainda não há posts suficientes para gerar um ranking.
          </p>
        )}
        {ranked.map((post) => {
          const Icon = TYPE_ICON[post.type];
          return (
          <li
            key={post.id}
            className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-accent/60 transition-colors"
          >
            <Link href={`/posts/${post.id}`} className="flex flex-col gap-1">
              <span className="flex items-center gap-2 font-medium">
                <Icon className="h-4 w-4 text-accent shrink-0" />
                {post.title}
              </span>
              <span className="text-xs text-black/50 dark:text-white/50">
                por {post.author.name} · {post.score} votos ·{" "}
                {post._count.comments} comentários
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
          );
        })}
      </ul>
    </div>
  );
}
