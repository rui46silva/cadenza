import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, MessageSquare, ThumbsUp, CheckCircle2, Inbox, Flame, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import { STREAK_MILESTONES } from "@/lib/streaks";
import Avatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import LevelBadge from "@/components/LevelBadge";
import LevelProgress from "@/components/LevelProgress";
import DashboardNav from "@/components/DashboardNav";
import FollowedTagsManager from "@/components/FollowedTagsManager";

const TABS = ["resumo", "editar", "preferencias"] as const;
type Tab = (typeof TABS)[number];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const { tab } = await searchParams;
  const active: Tab = (TABS as readonly string[]).includes(tab ?? "")
    ? (tab as Tab)
    : "resumo";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      instrument: true,
      gender: true,
      bio: true,
      avatarUrl: true,
      instagramHandle: true,
      verificationStatus: true,
      emailVerified: true,
      points: true,
      currentStreak: true,
      isAmbassador: true,
    },
  });
  if (!user) redirect("/login");

  const isVerifiedPro =
    (VERIFIABLE_ROLES as readonly string[]).includes(user.role) &&
    user.verificationStatus === "APPROVED";

  // Dados por separador (só corre o que a vista atual precisa).
  const openQuestions =
    active === "resumo" && isVerifiedPro
      ? await prisma.post.count({
          where: {
            isQuestion: true,
            bestAnswerId: null,
            authorId: { not: userId },
            OR: [
              { directedToId: userId },
              ...(user.instrument
                ? [{ tags: { some: { tag: { name: { equals: user.instrument, mode: "insensitive" as const } } } } }]
                : []),
            ],
          },
        })
      : 0;

  const impact =
    active === "resumo" && user.isAmbassador
      ? await (async () => {
          const [totalViews, commentsReceived, upvotesReceived, bestAnswersGiven] =
            await Promise.all([
              prisma.post.aggregate({ where: { authorId: userId }, _sum: { views: true } }),
              prisma.comment.count({
                where: { post: { authorId: userId }, authorId: { not: userId } },
              }),
              prisma.postVote.count({ where: { value: "UP", post: { authorId: userId } } }),
              prisma.post.count({ where: { bestAnswer: { authorId: userId } } }),
            ]);
          return {
            views: totalViews._sum.views ?? 0,
            commentsReceived,
            upvotesReceived,
            bestAnswersGiven,
          };
        })()
      : null;

  const [allTags, followedTags] =
    active === "preferencias"
      ? await Promise.all([
          prisma.tag.findMany({
            orderBy: { posts: { _count: "desc" } },
            take: 24,
            select: { id: true, name: true },
          }),
          prisma.tagFollow.findMany({ where: { userId }, select: { tagId: true } }),
        ])
      : [[], []];

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-6 px-4 py-6">
      {/* Cartão de identidade — sempre visível */}
      <section className="flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/10 p-5 sm:flex-row sm:items-center">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size={64} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge user={user} />
            <LevelBadge points={user.points} />
          </div>
        </div>
        <Link
          href={`/perfil/${userId}`}
          className="flex items-center gap-1.5 self-start rounded-full border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent sm:self-center"
        >
          <ExternalLink className="h-4 w-4" />
          Ver perfil público
        </Link>
      </section>

      <DashboardNav active={active} showAnswer={isVerifiedPro} />

      {active === "resumo" && (
        <div className="flex flex-col gap-6">
          <LevelProgress points={user.points} />

          {user.currentStreak >= 2 &&
            (() => {
              const next = STREAK_MILESTONES.find((m) => m.days > user.currentStreak);
              return (
                <div className="flex items-center gap-3 rounded-xl border border-orange-500/40 bg-orange-500/5 p-4">
                  <Flame className="h-5 w-5 shrink-0 text-orange-500" />
                  <span className="flex-1 text-sm">
                    <strong>{user.currentStreak} dias seguidos!</strong>{" "}
                    <span className="text-black/60 dark:text-white/60">
                      Volta amanhã para não perderes a sequência
                      {next ? ` — aos ${next.days} dias ganhas +${next.bonus} pontos.` : "."}
                    </span>
                  </span>
                </div>
              );
            })()}

          {isVerifiedPro && openQuestions > 0 && (
            <Link
              href="/duvidas/responder"
              className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4 transition-colors hover:border-accent"
            >
              <Inbox className="h-5 w-5 shrink-0 text-accent" />
              <span className="flex-1 text-sm">
                <strong>
                  {openQuestions === 1
                    ? "1 dúvida à tua espera"
                    : `${openQuestions} dúvidas à tua espera`}
                </strong>
                <span className="block text-black/60 dark:text-white/60">
                  Dirigidas a ti ou do teu instrumento — responde e ganha pontos.
                </span>
              </span>
            </Link>
          )}

          {impact && (
            <div>
              <h2 className="font-semibold mb-1">O teu impacto</h2>
              <p className="text-sm text-black/50 dark:text-white/50 mb-3">
                Como embaixador, isto é o que a tua atividade tem gerado na comunidade.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Eye, value: impact.views, label: "Visualizações" },
                  { icon: MessageSquare, value: impact.commentsReceived, label: "Comentários recebidos" },
                  { icon: ThumbsUp, value: impact.upvotesReceived, label: "Votos positivos" },
                  { icon: CheckCircle2, value: impact.bestAnswersGiven, label: "Dúvidas resolvidas" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center gap-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3 text-center"
                  >
                    <s.icon className="h-4 w-4 text-accent" />
                    <span className="text-lg font-bold">{s.value}</span>
                    <span className="text-xs text-black/50 dark:text-white/50">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {active === "editar" && (
        <div className="flex flex-col gap-6">
          {!user.emailVerified && <EmailVerificationBanner />}
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-5">
            <h2 className="font-semibold mb-4">Editar perfil</h2>
            <ProfileForm profile={user} />
          </div>
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-5">
            <h2 className="font-semibold mb-4">Alterar palavra-passe</h2>
            <ChangePasswordForm />
          </div>
        </div>
      )}

      {active === "preferencias" && (
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
      )}
    </div>
  );
}
