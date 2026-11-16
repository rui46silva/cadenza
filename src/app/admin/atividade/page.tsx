import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";

const PAGE_SIZE = 50;
const ENTITY_LABEL: Record<string, string> = { news: "Notícia", job: "Vaga", page: "Página", user: "Utilizador", seo: "SEO", media: "Media" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ p?: string; tipo?: string }> }) {
  await requireAdmin();
  const { p = "1", tipo = "" } = await searchParams;
  const pageNum = Math.max(1, Number(p) || 1);
  const where = tipo ? { entityType: tipo } : {};
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (pageNum - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.activityLog.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminHeader title="Registo de atividade" description="Quem fez o quê no painel de administração." />
      <div className="flex flex-wrap gap-1 text-sm">
        {["", ...Object.keys(ENTITY_LABEL)].map((t) => (
          <Link key={t} href={`/admin/atividade${t ? `?tipo=${t}` : ""}`} className={`rounded-full px-3 py-1 ${tipo === t ? "bg-accent/10 font-medium text-accent" : "text-black/60 hover:text-accent dark:text-white/60"}`}>{t ? ENTITY_LABEL[t] : "Tudo"}</Link>
        ))}
      </div>
      <ol className="divide-y divide-black/5 rounded-xl border border-black/10 dark:divide-white/10 dark:border-white/10">
        {logs.map((l) => (
          <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-sm">
            <span><span className="font-medium">{l.actorName}</span> {l.summary}</span>
            <span className="text-xs text-black/40 dark:text-white/40">{ENTITY_LABEL[l.entityType] ?? l.entityType} · {l.createdAt.toLocaleString("pt-PT")}</span>
          </li>
        ))}
        {logs.length === 0 && <li className="px-4 py-8 text-center text-sm text-black/50 dark:text-white/50">Sem atividade registada.</li>}
      </ol>
      {pages > 1 && (
        <div className="flex justify-between text-sm">
          {pageNum > 1 ? <Link href={`/admin/atividade?p=${pageNum - 1}${tipo ? `&tipo=${tipo}` : ""}`} className="text-accent">← Anteriores</Link> : <span />}
          <span className="text-black/50 dark:text-white/50">{pageNum} / {pages}</span>
          {pageNum < pages ? <Link href={`/admin/atividade?p=${pageNum + 1}${tipo ? `&tipo=${tipo}` : ""}`} className="text-accent">Seguintes →</Link> : <span />}
        </div>
      )}
    </>
  );
}
