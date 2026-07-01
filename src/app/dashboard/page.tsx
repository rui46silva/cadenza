import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoleBadge from "@/components/RoleBadge";
import ProfileForm from "@/components/ProfileForm";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import LevelBadge from "@/components/LevelBadge";
import FollowedTagsManager from "@/components/FollowedTagsManager";

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
      instagramHandle: true,
      verificationStatus: true,
      emailVerified: true,
      points: true,
    },
  });

  if (!user) redirect("/login");

  const [allTags, followedTags] = await Promise.all([
    prisma.tag.findMany({
      orderBy: { posts: { _count: "desc" } },
      take: 24,
      select: { id: true, name: true },
    }),
    prisma.tagFollow.findMany({
      where: { userId: session.user.id },
      select: { tagId: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-md flex flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">O meu perfil</h1>
        <p className="text-sm text-black/50 dark:text-white/50">{user.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RoleBadge user={user} />
          <LevelBadge points={user.points} />
        </div>
      </div>

      {!user.emailVerified && <EmailVerificationBanner />}

      <ProfileForm profile={user} />

      <div>
        <h2 className="font-semibold mb-1">Tópicos que sigo</h2>
        <p className="text-sm text-black/50 dark:text-white/50 mb-3">
          Aparecem no separador &ldquo;Para ti&rdquo; do fórum.
        </p>
        <FollowedTagsManager
          allTags={allTags}
          initialFollowedIds={followedTags.map((f) => f.tagId)}
        />
      </div>
    </div>
  );
}
