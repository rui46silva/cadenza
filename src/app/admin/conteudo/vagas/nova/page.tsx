import { requireContentEditor } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import JobEditor from "@/components/admin/JobEditor";

export default async function NewJobPage() {
  await requireContentEditor();
  return (
    <>
      <AdminHeader title="Nova vaga" />
      <JobEditor job={null} />
    </>
  );
}
