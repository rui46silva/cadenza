import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoleBadge from "@/components/RoleBadge";
import ProfileForm from "@/components/ProfileForm";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      instrument: true,
      bio: true,
      avatarUrl: true,
      verificationStatus: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-md flex flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">O meu perfil</h1>
        <p className="text-sm text-black/50 dark:text-white/50">{user.email}</p>
        <div className="mt-2">
          <RoleBadge user={user} />
        </div>
      </div>

      <ProfileForm profile={user} />
    </div>
  );
}
