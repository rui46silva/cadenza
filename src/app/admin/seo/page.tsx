import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import { MANAGED_PAGES } from "@/lib/pageMeta";
import { analyzeSeo, seoScore } from "@/lib/seoAnalysis";
import AdminHeader from "@/components/admin/AdminHeader";
import PageMetaManager from "@/components/admin/PageMetaManager";

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${cls}`}>{score}</span>;
}

export default async function AdminSeoPage() {
  await requireContentEditor();

  const [overrides, news, jobs, cmsPages] = await Promise.all([
    prisma.pageMeta.findMany(),
    prisma.newsArticle.findMany({
      select: { id: true, title: true, slug: true, metaDescription: true, focusKeyword: true, content: true, summary: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.jobListing.findMany({
      select: { id: true, title: true, slug: true, metaDescription: true, focusKeyword: true, description: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.cmsPage.findMany({
      select: { id: true, title: true, slug: true, metaDescription: true, focusKeyword: true, content: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  const byPath = new Map(overrides.map((o) => [o.path, o]));

  const pages = MANAGED_PAGES.map((p) => ({
    ...p,
    title: byPath.get(p.path)?.title ?? "",
    metaDescription: byPath.get(p.path)?.metaDescription ?? "",
    focusKeyword: byPath.get(p.path)?.focusKeyword ?? "",
  }));

  type Row = { key: string; kind: string; title: string; href: string; score: number; missingMeta: boolean };
  const rows: Row[] = [
    ...pages.map((p) => ({
      key: `page-${p.path}`,
      kind: "Página fixa",
      title: p.label,
      href: "#paginas-fixas",
      score: seoScore(analyzeSeo({ title: p.title || p.defaultTitle, metaDescription: p.metaDescription || p.defaultDescription, focusKeyword: p.focusKeyword })),
      missingMeta: !p.metaDescription,
    })),
    ...cmsPages.map((p) => ({
      key: `cms-${p.id}`,
      kind: "Página",
      title: p.title,
      href: `/admin/conteudo/paginas/${p.id}`,
      score: seoScore(analyzeSeo({ title: p.title, metaDescription: p.metaDescription, slug: p.slug, content: p.content, focusKeyword: p.focusKeyword })),
      missingMeta: !p.metaDescription,
    })),
    ...news.map((n) => ({
      key: `news-${n.id}`,
      kind: "Notícia",
      title: n.title,
      href: `/admin/conteudo/noticias/${n.id}`,
      score: seoScore(analyzeSeo({ title: n.title, metaDescription: n.metaDescription, slug: n.slug, content: n.content ?? n.summary, focusKeyword: n.focusKeyword })),
      missingMeta: !n.metaDescription,
    })),
    ...jobs.map((j) => ({
      key: `job-${j.id}`,
      kind: "Vaga",
      title: j.title,
      href: `/admin/conteudo/vagas/${j.id}`,
      score: seoScore(analyzeSeo({ title: j.title, metaDescription: j.metaDescription, slug: j.slug, content: j.description, focusKeyword: j.focusKeyword })),
      missingMeta: !j.metaDescription,
    })),
  ].sort((a, b) => a.score - b.score);

  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;
  const missing = rows.filter((r) => r.missingMeta).length;
  const good = rows.filter((r) => r.score >= 70).length;

  return (
    <>
      <AdminHeader title="SEO" description="Saúde SEO de todo o conteúdo e meta das páginas fixas." />

      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <p className="text-xs text-black/50 dark:text-white/50">Pontuação média</p>
          <p className="mt-1 text-2xl font-bold"><ScoreBadge score={avg} /></p>
        </div>
        <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <p className="text-xs text-black/50 dark:text-white/50">Em bom estado</p>
          <p className="mt-1 text-2xl font-bold">{good}/{rows.length}</p>
        </div>
        <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <p className="text-xs text-black/50 dark:text-white/50">Sem meta-descrição</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{missing}</p>
        </div>
      </section>

      <section className="rounded-xl border border-black/10 dark:border-white/10">
        <h2 className="border-b border-black/10 px-4 py-3 font-semibold dark:border-white/10">A melhorar primeiro</h2>
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {rows.slice(0, 15).map((r) => (
            <li key={r.key} className="flex items-center gap-3 px-4 py-2 text-sm">
              <ScoreBadge score={r.score} />
              <span className="w-24 shrink-0 text-xs text-black/40 dark:text-white/40">{r.kind}</span>
              <Link href={r.href} className="flex-1 truncate hover:text-accent">{r.title}</Link>
              {r.missingMeta && <span className="shrink-0 text-xs text-rose-500">sem meta</span>}
            </li>
          ))}
        </ul>
      </section>

      <section id="paginas-fixas" className="flex flex-col gap-3">
        <h2 className="font-semibold">Páginas fixas</h2>
        <PageMetaManager pages={pages} />
      </section>
    </>
  );
}
