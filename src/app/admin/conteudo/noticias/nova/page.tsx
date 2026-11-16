import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import NewsEditor from "@/components/admin/NewsEditor";

export default async function NewNewsPage() {
  await requireContentEditor();
  const cats = await prisma.newsArticle.findMany({ where: { category: { not: null } }, distinct: ["category"], select: { category: true } });
  return (
    <>
      <AdminHeader title="Nova notícia" />
      <NewsEditor article={null} categories={cats.map((c) => c.category!).filter(Boolean)} />
    </>
  );
}
