import Link from "next/link";
import type { Metadata } from "next";
import { GraduationCap, FileText, MessageSquare, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import Avatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import AskQuestionButton from "@/components/AskQuestionButton";
import { isFeaturedActive } from "@/lib/monetization";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/professores", {
    title: "Professores e profissionais",
    description:
      "Diretório de professores certificados e músicos profissionais verificados da Cadenza — tira as tuas dúvidas diretamente com eles.",
  });
}

export default async function ProfessoresPage() {
  const session = await auth();

  const pros = await prisma.user.findMany({
    where: {
      role: { in: [...VERIFIABLE_ROLES] },
      verificationStatus: "APPROVED",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      role: true,
      instrument: true,
      gender: true,
      bio: true,
      avatarUrl: true,
      isAmbassador: true,
      featuredUntil: true,
      verificationStatus: true,
      points: true,
      _count: { select: { posts: true, comments: true } },
    },
    // Hierarquia: embaixadores primeiro, depois por reputação (pontos).
    orderBy: [{ isAmbassador: "desc" }, { points: "desc" }],
  });

  // Perfis em destaque pago sobem ao topo (mantendo a ordem relativa restante).
  const isFeatured = (u: { featuredUntil: Date | null }) => isFeaturedActive(u);
  pros.sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <GraduationCap className="h-6 w-6 text-accent" />
          Professores e profissionais
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Contas verificadas pela equipa Cadenza. Tira uma dúvida diretamente
          com quem sabe — a resposta fica pública e ajuda toda a comunidade.
        </p>
      </section>

      {pros.length === 0 ? (
        <p className="text-black/50 dark:text-white/50">
          Ainda não há professores verificados. Volta em breve.
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {pros.map((user) => (
            <div
              key={user.id}
              className={
                user.isAmbassador
                  ? "flex flex-col gap-3 rounded-xl border border-transparent bg-gradient-to-br from-amber-400/10 via-fuchsia-500/10 to-accent/10 p-4 shadow-sm ring-1 ring-fuchsia-500/30 transition-colors hover:ring-fuchsia-500/60"
                  : "flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/10 p-4 transition-colors hover:border-accent/60"
              }
            >
              <Link href={`/perfil/${user.id}`} className="flex items-start gap-3">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size={48} />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {user.name}
                    {isFeatured(user) && (
                      <span className="flex items-center gap-0.5 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        <Star className="h-2.5 w-2.5" fill="currentColor" />
                        Destaque
                      </span>
                    )}
                  </span>
                  <RoleBadge user={user} />
                </div>
              </Link>
              {user.bio && (
                <p className="line-clamp-2 text-sm text-black/70 dark:text-white/70">
                  {user.bio}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-black/50 dark:text-white/50">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {user._count.posts}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {user._count.comments}
                  </span>
                </div>
                {session?.user?.id === user.id ? (
                  <span className="text-xs text-black/40 dark:text-white/40">
                    A tua conta
                  </span>
                ) : session?.user ? (
                  <AskQuestionButton expertId={user.id} />
                ) : null}
              </div>
            </div>
          ))}
        </section>
      )}

      {!session?.user && (
        <p className="text-sm text-black/50 dark:text-white/50">
          <Link href="/login" className="text-accent hover:underline">
            Entra na tua conta
          </Link>{" "}
          para tirares uma dúvida com um professor.
        </p>
      )}
    </div>
  );
}
