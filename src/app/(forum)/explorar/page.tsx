import Link from "next/link";
import { Compass, MessagesSquare, Flame, Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { groupTagsByCategory } from "@/lib/tagCategories";
import { card, pill } from "@/lib/ui";

export default async function ExplorarPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });

  const tagGroups = groupTagsByCategory(tags);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Compass className="h-6 w-6 text-accent" />
          Explorar
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Descobre conteúdo e comunidades dentro do Cadenza.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/forum" className={card}>
          <MessagesSquare className="h-6 w-6 text-accent" />
          <h2 className="font-semibold mt-1">Fórum</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Todos os posts em texto e vídeo da comunidade.
          </p>
        </Link>
        <Link href="/popular" className={card}>
          <Flame className="h-6 w-6 text-accent" />
          <h2 className="font-semibold mt-1">Popular</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Os posts mais votados pela comunidade.
          </p>
        </Link>
        <Link href="/noticias" className={card}>
          <Newspaper className="h-6 w-6 text-accent" />
          <h2 className="font-semibold mt-1">Notícias</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Notícias do mundo da música (brevemente).
          </p>
        </Link>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-semibold">Comunidades por categoria</h2>
        {tagGroups.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Ainda não há comunidades.
          </p>
        )}
        {tagGroups.map((group) => (
          <div key={group.category} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-black/40 dark:text-white/40">
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/forum?tag=${encodeURIComponent(t.name)}`}
                  className={pill}
                >
                  #{t.name} ({t._count.posts})
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
