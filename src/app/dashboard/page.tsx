import { redirect } from "next/navigation";
import { Eye, MessageSquare, ThumbsUp, CheckCircle2 } from "lucide-react";
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
      isAmbassador: true,
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

  const impact = user.isAmbassador
    ? await (async () => {
        const [totalViews, commentsReceived, upvotesReceived, bestAnswersGiven] =
          await Promise.all([
            prisma.post.aggregate({
              where: { authorId: session.user.id },
              _sum: { views: true },
            }),
            prisma.comment.count({
              where: { post: { authorId: session.user.id }, authorId: { not: session.user.id } },
            }),
            prisma.postVote.count({
              where: { value: "UP", post: { authorId: session.user.id } },
            }),
            prisma.post.count({
              where: { bestAnswer: { authorId: session.user.id } },
            }),
          ]);
        return {
          views: totalViews._sum.views ?? 0,
          commentsReceived,
          upvotesReceived,
          bestAnswersGiven,
        };
      })()
    : null;

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

      {impact && (
        <div>
          <h2 className="font-semibold mb-1">O teu impacto</h2>
          <p className="text-sm text-black/50 dark:text-white/50 mb-3">
            Como embaixador, isto é o que a tua atividade tem gerado na comunidade.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3 text-center">
              <Eye className="h-4 w-4 text-accent" />
              <span className="text-lg font-bold">{impact.views}</span>
              <span className="text-xs text-black/50 dark:text-white/50">Visualizações nos teus posts</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3 text-center">
              <MessageSquare className="h-4 w-4 text-accent" />
              <span className="text-lg font-bold">{impact.commentsReceived}</span>
              <span className="text-xs text-black/50 dark:text-white/50">Comentários recebidos</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3 text-center">
              <ThumbsUp className="h-4 w-4 text-accent" />
              <span className="text-lg font-bold">{impact.upvotesReceived}</span>
              <span className="text-xs text-black/50 dark:text-white/50">Votos positivos recebidos</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3 text-center">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span className="text-lg font-bold">{impact.bestAnswersGiven}</span>
              <span className="text-xs text-black/50 dark:text-white/50">Dúvidas que resolveste</span>
            </div>
          </div>
        </div>
      )}

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
