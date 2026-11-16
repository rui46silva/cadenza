import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminHeader from "@/components/admin/AdminHeader";
import WaitlistList from "@/components/WaitlistList";

export default async function AdminWaitlistPage() {
  await requireAdmin();

  const signups = await prisma.waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, instrument: true, invitedAt: true, createdAt: true },
  });
  const invited = signups.filter((s) => s.invitedAt).length;

  return (
    <>
      <AdminHeader
        title="Lista de espera"
        description={`${signups.length} inscritos · ${invited} convidados · ${signups.length - invited} por convidar`}
      />
      <WaitlistList
        entries={signups.map((w) => ({
          id: w.id,
          email: w.email,
          name: w.name,
          instrument: w.instrument,
          invited: Boolean(w.invitedAt),
          date: w.createdAt.toLocaleDateString("pt-PT"),
        }))}
      />
    </>
  );
}
