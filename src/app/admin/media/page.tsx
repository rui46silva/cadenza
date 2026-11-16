import { requireContentEditor } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  await requireContentEditor();
  return (
    <>
      <AdminHeader title="Biblioteca de media" description="Imagens reutilizáveis (por URL) para notícias, vagas e páginas." />
      <MediaLibrary />
    </>
  );
}
