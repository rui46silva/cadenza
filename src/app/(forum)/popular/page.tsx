import { Fragment } from "react";
import Link from "next/link";
import { Flame, FileText, Video, Pin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import AdSlot from "@/components/AdSlot";

const TYPE_ICON: Record<string, typeof FileText> = {
  TEXT: FileText,
  VIDEO: Video,
};

// Após quantos posts aparece o anúncio intercalado no ranking.
const FEED_AD_AFTER = 4;

export default async function PopularPage() {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { id: true, name: true, role: true, avatarUrl: true } },
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
        {ranked.map((post, index) => {
          const Icon = TYPE_ICON[post.type];
          return (
          <Fragment key={post.id}>
          <li
            className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-accent/60 transition-colors flex flex-col gap-1"
          >
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
              · {post.score} votos · {post._count.comments} comentários
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
    </div>
  );
}
