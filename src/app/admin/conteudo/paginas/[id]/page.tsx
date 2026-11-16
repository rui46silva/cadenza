import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import PageEditor from "@/components/admin/PageEditor";

export default async function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireContentEditor();
  const { id } = await params;
  const page = await prisma.cmsPage.findUnique({ where: { id } });
  if (!page) notFound();
  return (
    <>
      <AdminHeader title="Editar página" />
      <PageEditor page={page} />
    </>
  );
}
