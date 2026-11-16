import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import { JOB_TYPE_LABELS } from "@/lib/jobTypes";
import { analyzeSeo, seoScore } from "@/lib/seoAnalysis";
import { isJobExpired } from "@/lib/jobStatus";
import AdminHeader from "@/components/admin/AdminHeader";
import ContentTable from "@/components/admin/ContentTable";

export default async function AdminJobsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  await requireContentEditor();
  const { q = "", estado = "" } = await searchParams;
  const now = new Date();

  const where: Prisma.JobListingWhereInput = {
    ...(estado === "ativas" ? { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } : {}),
    ...(estado === "expiradas" ? { expiresAt: { lte: now } } : {}),
    ...(estado === "destaque" ? { featured: true } : {}),
    ...(q ? { AND: [{ OR: [{ title: { contains: q, mode: "insensitive" } }, { organization: { contains: q, mode: "insensitive" } }] }] } : {}),
  };

  const jobs = await prisma.jobListing.findMany({ where, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 200 });

  const tabs = [
    { value: "", label: "Todas" },
    { value: "ativas", label: "Ativas" },
    { value: "destaque", label: "Em destaque" },
    { value: "expiradas", label: "Expiradas" },
  ];

  return (
    <>
      <AdminHeader
        title="Vagas e oportunidades"
        description="Cria e gere vagas com SEO, destaque e data de expiração."
        actions={<Link href="/admin/conteudo/vagas/nova" className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:brightness-110">+ Nova vaga</Link>}
      />
      <div className="flex flex-wrap gap-1 text-sm">
        {tabs.map((t) => (
          <Link key={t.value} href={`/admin/conteudo/vagas${t.value ? `?estado=${t.value}` : ""}`} className={`rounded-full px-3 py-1 ${estado === t.value ? "bg-accent/10 font-medium text-accent" : "text-black/60 hover:text-accent dark:text-white/60"}`}>{t.label}</Link>
        ))}
      </div>
      <form className="flex gap-2" action="/admin/conteudo/vagas">
        <input type="hidden" name="estado" value={estado} />
        <input name="q" defaultValue={q} placeholder="Pesquisar por título ou organização…" className="flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20" />
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">Pesquisar</button>
      </form>

      <ContentTable
        columns={["Vaga", "Tipo", "Estado", "SEO", "Criada"]}
        bulkEndpoint="/api/admin/jobs/bulk"
        bulkActions={[
          { action: "feature", label: "Destacar" },
          { action: "unfeature", label: "Remover destaque" },
          { action: "expire", label: "Terminar (expirar agora)" },
          { action: "delete", label: "Eliminar", danger: true },
        ]}
        emptyText="Sem vagas."
        rows={jobs.map((j) => {
          const expired = isJobExpired(j.expiresAt);
          const score = seoScore(analyzeSeo({ title: j.title, metaDescription: j.metaDescription, slug: j.slug, content: j.description, focusKeyword: j.focusKeyword }));
          return {
            id: j.id,
            href: `/admin/conteudo/vagas/${j.id}`,
            cells: [
              <span key="t" className="flex flex-col">
                {j.title}{j.featured && <span className="text-xs text-accent"> ★ destaque</span>}
                <span className="text-xs font-normal text-black/40 dark:text-white/40">{j.organization}{j.location ? ` · ${j.location}` : ""}</span>
              </span>,
              <span key="ty" className="text-xs">{JOB_TYPE_LABELS[j.type]}</span>,
              <span key="s" className="flex items-center gap-1.5 text-xs"><span className={`h-2 w-2 rounded-full ${expired ? "bg-black/40" : "bg-emerald-500"}`} />{expired ? "Expirada" : "Ativa"}</span>,
              <span key="seo" className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"}`}>{score}</span>,
              <span key="d" className="text-xs text-black/60 dark:text-white/60">{j.createdAt.toLocaleDateString("pt-PT")}</span>,
            ],
          };
        })}
      />
    </>
  );
}
