import Link from "next/link";
import { Newspaper, Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";
import NewsGrid from "@/components/NewsGrid";
import { pageMetadata } from "@/lib/pageMeta";

export function generateMetadata() {
  return pageMetadata("/noticias", {
    title: "Notícias",
    description:
      "Novidades do mundo da música, artigos e histórias selecionadas para a comunidade Cadenza.",
  });
}

export default async function NoticiasPage() {
  const articles = await prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Newspaper className="h-6 w-6 text-accent" />
          Notícias
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Novidades do mundo da música, selecionadas para a comunidade Cadenza.
        </p>
      </section>

      {articles.length === 0 ? (
        <p className="text-black/50 dark:text-white/50">
          Ainda não há notícias publicadas. Volta em breve.
        </p>
      ) : (
        <NewsGrid
          articles={articles.map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            summary: a.summary,
            imageUrl: a.imageUrl,
            source: a.source,
            publishedAt: a.publishedAt.toISOString(),
          }))}
        />
      )}

      <Link
        href="/vagas"
        className="flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/10 p-4 transition-colors hover:border-accent/60"
      >
        <Briefcase className="h-5 w-5 text-accent" />
        <span>
          <span className="font-semibold">Vagas e oportunidades</span>
          <span className="block text-sm text-black/60 dark:text-white/60">
            Posições em orquestras, bandas, coros e projetos musicais.
          </span>
        </span>
      </Link>
    </div>
  );
}
