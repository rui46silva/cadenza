import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireContentEditor } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import JobEditor from "@/components/admin/JobEditor";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireContentEditor();
  const { id } = await params;
  const job = await prisma.jobListing.findUnique({ where: { id } });
  if (!job) notFound();
  return (
    <>
      <AdminHeader title="Editar vaga" />
      <JobEditor job={{ ...job, expiresAt: job.expiresAt ? job.expiresAt.toISOString() : null }} />
    </>
  );
}
