import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import { newsStatus } from "@/lib/newsSchema";
import { analyzeSeo, seoScore } from "@/lib/seoAnalysis";
import AdminHeader from "@/components/admin/AdminHeader";
import ContentTable from "@/components/admin/ContentTable";

const STATUS_TABS = [
  { value: "", label: "Todas" },
  { value: "publicada", label: "Publicadas" },
  { value: "agendada", label: "Agendadas" },
  { value: "rascunho", label: "Rascunhos" },
];
const STATUS_LABEL = { draft: "Rascunho", scheduled: "Agendada", published: "Publicada" } as const;
const STATUS_DOT = { draft: "bg-black/40", scheduled: "bg-amber-500", published: "bg-emerald-500" } as const;

export default async function AdminNewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; categoria?: string }>;
}) {
  await requireContentEditor();
  const { q = "", estado = "", categoria = "" } = await searchParams;
  const now = new Date();

  const statusWhere: Prisma.NewsArticleWhereInput =
    estado === "rascunho"
      ? { published: false }
      : estado === "agendada"
      ? { published: true, publishedAt: { gt: now } }
      : estado === "publicada"
      ? { published: true, publishedAt: { lte: now } }
      : {};

  const where: Prisma.NewsArticleWhereInput = {
    ...statusWhere,
    ...(categoria ? { category: categoria } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }] } : {}),
  };

  const [articles, all, categories] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: 200,
      include: { createdBy: { select: { name: true } } },
    }),
    prisma.newsArticle.findMany({ select: { published: true, publishedAt: true } }),
    prisma.newsArticle.findMany({ where: { category: { not: null } }, distinct: ["category"], select: { category: true } }),
  ]);

  const counts = { "": all.length, publicada: 0, agendada: 0, rascunho: 0 } as Record<string, number>;
  for (const a of all) {
    const s = newsStatus(a);
    counts[s === "draft" ? "rascunho" : s === "scheduled" ? "agendada" : "publicada"]++;
  }

  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ q, estado, categoria, ...patch });
    for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <AdminHeader
        title="Notícias"
        description="Cria, agenda e otimiza as notícias da Cadenza."
        actions={
          <Link href="/admin/conteudo/noticias/nova" className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:brightness-110">
            + Nova notícia
          </Link>
        }
      />

      <div className="flex flex-wrap gap-1 text-sm">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/conteudo/noticias${qs({ estado: t.value })}`}
            className={`rounded-full px-3 py-1 ${estado === t.value ? "bg-accent/10 font-medium text-accent" : "text-black/60 hover:text-accent dark:text-white/60"}`}
          >
            {t.label} <span className="text-black/40 dark:text-white/40">({counts[t.value] ?? 0})</span>
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap gap-2" action="/admin/conteudo/noticias">
        <input type="hidden" name="estado" value={estado} />
        <input name="q" defaultValue={q} placeholder="Pesquisar notícias…" className="min-w-[200px] flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20" />
        <select name="categoria" defaultValue={categoria} className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20">
          <option value="">Todas as categorias</option>
          {categories.map((c) => c.category && <option key={c.category} value={c.category}>{c.category}</option>)}
        </select>
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">Filtrar</button>
      </form>

      <ContentTable
        columns={["Título", "Estado", "Categoria", "SEO", "Data"]}
        bulkEndpoint="/api/admin/news/bulk"
        bulkActions={[
          { action: "publish", label: "Publicar" },
          { action: "unpublish", label: "Passar a rascunho" },
          { action: "delete", label: "Eliminar", danger: true },
        ]}
        emptyText="Sem notícias. Cria a primeira!"
        rows={articles.map((a) => {
          const status = newsStatus(a);
          const score = seoScore(analyzeSeo({ title: a.title, metaDescription: a.metaDescription, slug: a.slug, content: a.content ?? a.summary, focusKeyword: a.focusKeyword }));
          return {
            id: a.id,
            href: `/admin/conteudo/noticias/${a.id}`,
            cells: [
              <span key="t" className="flex flex-col">
                {a.title}
                <span className="text-xs font-normal text-black/40 dark:text-white/40">por {a.createdBy.name} · /{a.slug ?? a.id}</span>
              </span>,
              <span key="s" className="flex items-center gap-1.5 text-xs">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                {STATUS_LABEL[status]}
              </span>,
              <span key="c" className="text-xs text-black/60 dark:text-white/60">{a.category ?? "—"}</span>,
              <span key="seo" className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"}`}>{score}</span>,
              <span key="d" className="text-xs text-black/60 dark:text-white/60">{a.publishedAt.toLocaleDateString("pt-PT")}</span>,
            ],
          };
        })}
      />
    </>
  );
}
