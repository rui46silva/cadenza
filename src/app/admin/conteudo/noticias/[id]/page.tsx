import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import NewsEditor from "@/components/admin/NewsEditor";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireContentEditor();
  const { id } = await params;
  const [article, cats] = await Promise.all([
    prisma.newsArticle.findUnique({ where: { id } }),
    prisma.newsArticle.findMany({ where: { category: { not: null } }, distinct: ["category"], select: { category: true } }),
  ]);
  if (!article) notFound();

  return (
    <>
      <AdminHeader title="Editar notícia" />
      <NewsEditor
        article={{ ...article, publishedAt: article.publishedAt.toISOString() }}
        categories={cats.map((c) => c.category!).filter(Boolean)}
      />
    </>
  );
}
