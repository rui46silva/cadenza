import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { renderMarkdown, markdownToText } from "@/lib/markdown";

async function getPage(slug: string) {
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  return page && page.published ? page : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  const description = page.metaDescription || markdownToText(page.content).slice(0, 160);
  return {
    title: page.title,
    description,
    alternates: { canonical: `/p/${page.slug}` },
    openGraph: { title: page.title, description, type: "article" },
  };
}

export default async function CmsPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold">{page.title}</h1>
      <div className="cms-prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }} />
      <p className="text-xs text-black/40 dark:text-white/40">Atualizada a {page.updatedAt.toLocaleDateString("pt-PT")}</p>
    </article>
  );
}
