import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import { analyzeSeo, seoScore } from "@/lib/seoAnalysis";
import AdminHeader from "@/components/admin/AdminHeader";
import ContentTable from "@/components/admin/ContentTable";

export default async function AdminPagesListPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireContentEditor();
  const { q = "" } = await searchParams;
  const pages = await prisma.cmsPage.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : {},
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        title="Páginas"
        description="Páginas livres do site (Sobre, Termos, guias…), publicadas em /p/slug."
        actions={<Link href="/admin/conteudo/paginas/nova" className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:brightness-110">+ Nova página</Link>}
      />
      <form className="flex gap-2" action="/admin/conteudo/paginas">
        <input name="q" defaultValue={q} placeholder="Pesquisar páginas…" className="flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20" />
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">Pesquisar</button>
      </form>
      <ContentTable
        columns={["Título", "Estado", "SEO", "Atualizada"]}
        bulkEndpoint="/api/admin/pages/bulk"
        bulkActions={[
          { action: "publish", label: "Publicar" },
          { action: "unpublish", label: "Passar a rascunho" },
          { action: "delete", label: "Eliminar", danger: true },
        ]}
        emptyText="Sem páginas. Cria a primeira!"
        rows={pages.map((p) => {
          const score = seoScore(analyzeSeo({ title: p.title, metaDescription: p.metaDescription, slug: p.slug, content: p.content, focusKeyword: p.focusKeyword }));
          return {
            id: p.id,
            href: `/admin/conteudo/paginas/${p.id}`,
            cells: [
              <span key="t" className="flex flex-col">{p.title}<span className="text-xs font-normal text-black/40 dark:text-white/40">/p/{p.slug}</span></span>,
              <span key="s" className="flex items-center gap-1.5 text-xs"><span className={`h-2 w-2 rounded-full ${p.published ? "bg-emerald-500" : "bg-black/40"}`} />{p.published ? "Publicada" : "Rascunho"}</span>,
              <span key="seo" className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"}`}>{score}</span>,
              <span key="d" className="text-xs text-black/60 dark:text-white/60">{p.updatedAt.toLocaleDateString("pt-PT")}</span>,
            ],
          };
        })}
      />
    </>
  );
}
