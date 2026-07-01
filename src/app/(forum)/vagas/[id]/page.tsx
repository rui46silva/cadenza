import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Briefcase, ExternalLink, Mail, MapPin, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonPrimary } from "@/lib/ui";
import { JOB_TYPE_LABELS } from "@/lib/jobTypes";
import { formatRelativeTime } from "@/lib/time";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.jobListing.findUnique({
    where: { id },
    select: { title: true, organization: true, description: true },
  });

  if (!job) return { title: "Vaga não encontrada" };

  return {
    title: `${job.title} · ${job.organization}`,
    description: job.description.slice(0, 160),
    alternates: { canonical: `/vagas/${id}` },
  };
}

export default async function JobListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.jobListing.findUnique({ where: { id } });

  if (!job) notFound();

  const expired = job.expiresAt ? job.expiresAt < new Date() : false;

  return (
    <article className="flex flex-col gap-5">
      <Link href="/noticias" className="text-sm text-black/50 dark:text-white/50 hover:text-accent">
        ← Vagas e oportunidades
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Briefcase className="h-5 w-5 text-accent shrink-0" />
          {job.title}
          {job.featured && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
              Destaque
            </span>
          )}
        </h1>
        <p className="text-black/60 dark:text-white/60">
          {job.organization} · {JOB_TYPE_LABELS[job.type]}
          {job.instrument ? ` · ${job.instrument}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-black/40 dark:text-white/40">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
          )}
          <span>Publicada {formatRelativeTime(job.createdAt)}</span>
          {job.expiresAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {expired
                ? "Candidaturas encerradas"
                : `Candidaturas até ${job.expiresAt.toLocaleDateString("pt-PT")}`}
            </span>
          )}
        </div>
      </header>

      <p className="leading-relaxed text-black/80 dark:text-white/80 whitespace-pre-wrap">
        {job.description}
      </p>

      {!expired && (job.applyUrl || job.contactEmail) && (
        <div className="flex flex-wrap items-center gap-3">
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonPrimary} inline-flex items-center gap-2`}
            >
              Candidatar
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {job.contactEmail && (
            <a
              href={`mailto:${job.contactEmail}`}
              className="flex items-center gap-2 rounded-md border border-black/15 dark:border-white/20 px-5 py-2.5 font-medium hover:border-accent hover:text-accent"
            >
              Contactar
              <Mail className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
