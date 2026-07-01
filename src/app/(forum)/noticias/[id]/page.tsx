import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Newspaper, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonOutline } from "@/lib/ui";
import { formatRelativeTime } from "@/lib/time";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({
    where: { id },
    select: { title: true, summary: true, published: true },
  });

  if (!article || !article.published) return { title: "Notícia não encontrada" };

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/noticias/${id}` },
    openGraph: { title: article.title, description: article.summary, type: "article" },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { id } });

  if (!article || !article.published) notFound();

  return (
    <article className="flex flex-col gap-5">
      <Link href="/noticias" className="text-sm text-black/50 dark:text-white/50 hover:text-accent">
        ← Notícias
      </Link>

      {article.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.imageUrl}
          alt=""
          className="h-56 w-full rounded-lg object-cover sm:h-72"
        />
      )}

      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Newspaper className="h-5 w-5 text-accent shrink-0" />
          {article.title}
        </h1>
        <p className="text-sm text-black/40 dark:text-white/40">
          {article.source ?? "Cadenza"} · {formatRelativeTime(article.publishedAt)}
        </p>
      </header>

      <p className="leading-relaxed text-black/80 dark:text-white/80">{article.summary}</p>

      {article.url && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonOutline} inline-flex w-fit items-center gap-2`}
        >
          Ler artigo completo
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </article>
  );
}
