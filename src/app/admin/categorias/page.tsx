import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import TagCategoryManager from "@/components/admin/TagCategoryManager";

export default async function AdminCategoriesPage() {
  await requireStaff();

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <AdminHeader
        title="Categorias e tags"
        description="Tópicos criados pelos utilizadores começam como “Outras”; reatribui-os à categoria certa para aparecerem em /categorias."
      />
      <TagCategoryManager
        tags={tags.map((t) => ({ id: t.id, name: t.name, category: t.category, postCount: t._count.posts }))}
      />
    </>
  );
}
