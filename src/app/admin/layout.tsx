import { prisma } from "@/lib/prisma";
import { requireAdminArea } from "@/lib/adminAuth";
import { isStaff } from "@/lib/moderation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Administração", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, isAdmin } = await requireAdminArea();

  const [reports, verifications, waitlist] = await Promise.all([
    isStaff(role) ? prisma.report.count({ where: { status: "PENDING" } }) : 0,
    isAdmin ? prisma.user.count({ where: { verificationStatus: "PENDING", deletedAt: null } }) : 0,
    isAdmin ? prisma.waitlistSignup.count({ where: { invitedAt: null } }) : 0,
  ]);

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
      <AdminSidebar role={role} counts={{ reports, verifications, waitlist }} />
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}
