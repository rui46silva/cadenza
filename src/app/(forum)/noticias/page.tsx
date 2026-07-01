import Link from "next/link";
import { Newspaper, Briefcase, ExternalLink, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { card } from "@/lib/ui";
import { JOB_TYPE_LABELS } from "@/lib/jobTypes";
import { formatRelativeTime } from "@/lib/time";

export const metadata = {
  title: "Notícias",
};

export default async function NoticiasPage() {
  const [articles, jobs] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
    prisma.jobListing.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

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

      <section className="flex flex-col gap-3">
        {articles.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Ainda não há notícias publicadas. Volta em breve.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {articles.map((a) => (
            <div key={a.id} className={`${card} flex flex-col gap-2`}>
              {a.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.imageUrl}
                  alt=""
                  className="mb-1 h-36 w-full rounded-md object-cover"
                />
              )}
              <span className="font-semibold">{a.title}</span>
              <span className="text-sm text-black/60 dark:text-white/60">{a.summary}</span>
              <span className="flex items-center justify-between text-xs text-black/40 dark:text-white/40">
                <span>
                  {a.source ?? "Cadenza"} · {formatRelativeTime(a.publishedAt)}
                </span>
                {a.url && (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-accent hover:underline"
                  >
                    Ler mais
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Briefcase className="h-5 w-5 text-accent" />
            Vagas e oportunidades
          </h2>
          <p className="text-black/60 dark:text-white/60">
            Posições em orquestras, bandas filarmónicas, coros e outros projetos musicais.
          </p>
        </div>
        {jobs.length === 0 && (
          <p className="text-black/50 dark:text-white/50">Ainda não há vagas em aberto.</p>
        )}
        <div className="flex flex-col gap-3">
          {jobs.map((j) => (
            <div
              key={j.id}
              className={`${card} flex flex-col gap-2 ${
                j.featured ? "border-accent/60 bg-accent/5" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="font-semibold">{j.title}</span>
                  {j.featured && (
                    <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                      Destaque
                    </span>
                  )}
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {j.organization} · {JOB_TYPE_LABELS[j.type]}
                    {j.location ? ` · ${j.location}` : ""}
                    {j.instrument ? ` · ${j.instrument}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {j.applyUrl && (
                    <a
                      href={j.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent"
                    >
                      Candidatar
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {j.contactEmail && (
                    <a
                      href={`mailto:${j.contactEmail}`}
                      className="flex items-center gap-1 rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent"
                    >
                      Contactar
                      <Mail className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-black/70 dark:text-white/70 whitespace-pre-wrap">
                {j.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-black/40 dark:text-white/40">
        És uma orquestra, banda ou conservatório e queres publicar uma vaga?{" "}
        <Link href="/dashboard" className="underline">
          Contacta a equipa Cadenza
        </Link>
        .
      </p>
    </div>
  );
}
