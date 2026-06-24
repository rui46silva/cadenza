import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ExplorarPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-bold">🧭 Explorar</h1>
        <p className="text-black/60 dark:text-white/60">
          Descobre conteúdo e comunidades dentro do Cadenza.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/forum"
          className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
        >
          <span className="text-2xl">💬</span>
          <h2 className="font-semibold mt-1">Fórum</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Todos os posts em texto e vídeo da comunidade.
          </p>
        </Link>
        <Link
          href="/popular"
          className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
        >
          <span className="text-2xl">🔥</span>
          <h2 className="font-semibold mt-1">Popular</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Os posts mais votados pela comunidade.
          </p>
        </Link>
        <Link
          href="/noticias"
          className="rounded-lg border border-black/10 dark:border-white/10 p-4 hover:border-black/30 dark:hover:border-white/30 transition-colors"
        >
          <span className="text-2xl">📰</span>
          <h2 className="font-semibold mt-1">Notícias</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            Notícias do mundo da música (brevemente).
          </p>
        </Link>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Comunidades (tags)</h2>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && (
            <p className="text-black/50 dark:text-white/50">
              Ainda não há comunidades.
            </p>
          )}
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/forum?tag=${encodeURIComponent(t.name)}`}
              className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-black/30 dark:hover:border-white/30"
            >
              #{t.name} ({t._count.posts})
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
