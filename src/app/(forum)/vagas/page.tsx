import Link from "next/link";
import { Briefcase, ExternalLink, Mail, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { card } from "@/lib/ui";
import { JOB_TYPE_LABELS } from "@/lib/jobTypes";

export const metadata = {
  title: "Vagas e oportunidades",
  description:
    "Vagas em orquestras, bandas filarmónicas, coros e projetos musicais. Encontra a tua próxima oportunidade na Cadenza.",
};

export default async function VagasPage() {
  const jobs = await prisma.jobListing.findMany({
    where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 40,
  });

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Briefcase className="h-6 w-6 text-accent" />
          Vagas e oportunidades
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Posições em orquestras, bandas filarmónicas, coros e outros projetos musicais.
        </p>
      </section>

      {jobs.length === 0 && (
        <p className="text-black/50 dark:text-white/50">Ainda não há vagas em aberto.</p>
      )}

      <div className="flex flex-col gap-3">
        {jobs.map((j) => (
          <div
            key={j.id}
            className={
              j.featured
                ? "relative overflow-hidden rounded-lg border border-accent/60 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-4 shadow-sm ring-1 ring-accent/20 transition-colors hover:border-accent flex flex-col gap-2"
                : `${card} flex flex-col gap-2`
            }
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                {j.featured && (
                  <span className="mb-1 flex w-fit items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground shadow-sm">
                    <Star className="h-3 w-3" fill="currentColor" />
                    Destaque
                  </span>
                )}
                <Link href={`/vagas/${j.id}`} className="font-semibold hover:text-accent hover:underline">
                  {j.title}
                </Link>
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
            <p className="text-sm text-black/70 dark:text-white/70 line-clamp-3">{j.description}</p>
          </div>
        ))}
      </div>

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
