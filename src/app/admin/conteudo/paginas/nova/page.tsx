import { requireContentEditor } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import PageEditor from "@/components/admin/PageEditor";

export default async function NewCmsPage() {
  await requireContentEditor();
  return (
    <>
      <AdminHeader title="Nova página" />
      <PageEditor page={null} />
    </>
  );
}
