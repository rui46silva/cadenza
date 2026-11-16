import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/adminAuth";
import { INFRACTION_LABELS } from "@/lib/moderation";
import { formatRelativeTime } from "@/lib/time";
import AdminHeader from "@/components/admin/AdminHeader";
import ReportActions from "@/components/ReportActions";

const REPORT_STATUS_LABEL: Record<string, string> = {
  POST_DELETED: "Post eliminado",
  AUTHOR_BANNED: "Autor banido",
  DISMISSED: "Arquivada",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  await requireStaff();
  const { estado = "PENDING" } = await searchParams;
  const pending = estado !== "resolvidas";

  const reports = await prisma.report.findMany({
    where: pending ? { status: "PENDING" } : { status: { not: "PENDING" } },
    include: {
      post: { select: { id: true, slug: true, title: true, author: { select: { name: true } } } },
      reporter: { select: { name: true } },
      resolvedBy: { select: { name: true } },
    },
    orderBy: { createdAt: pending ? "asc" : "desc" },
    take: 100,
  });

  return (
    <>
      <AdminHeader title="Denúncias" description="Conteúdo reportado pela comunidade." />
      <div className="flex gap-2">
        <Link href="/admin/denuncias" className={`rounded-full px-3 py-1.5 text-sm ${pending ? "bg-accent text-accent-foreground" : "border border-black/15 dark:border-white/20"}`}>Pendentes</Link>
        <Link href="/admin/denuncias?estado=resolvidas" className={`rounded-full px-3 py-1.5 text-sm ${!pending ? "bg-accent text-accent-foreground" : "border border-black/15 dark:border-white/20"}`}>Resolvidas</Link>
      </div>

      <ul className="flex flex-col gap-3">
        {reports.length === 0 && <p className="text-black/50 dark:text-white/50">Sem denúncias {pending ? "pendentes" : "resolvidas"}.</p>}
        {reports.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 rounded-xl border border-black/10 p-4 dark:border-white/10">
            <Link href={`/posts/${r.post.slug ?? r.post.id}`} className="font-medium hover:text-accent hover:underline">{r.post.title}</Link>
            <p className="text-xs text-black/50 dark:text-white/50">
              de {r.post.author.name} · denunciado por {r.reporter.name} · {INFRACTION_LABELS[r.reason]} · {formatRelativeTime(r.createdAt)}
            </p>
            {r.details && <p className="text-sm text-black/60 dark:text-white/60">&ldquo;{r.details}&rdquo;</p>}
            {pending ? (
              <ReportActions reportId={r.id} />
            ) : (
              <p className="text-xs text-black/40 dark:text-white/40">
                {REPORT_STATUS_LABEL[r.status] ?? r.status}{r.resolvedBy ? ` por ${r.resolvedBy.name}` : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
