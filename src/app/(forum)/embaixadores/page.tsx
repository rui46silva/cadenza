import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, FileText, MessageSquare, Crown, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import { AmbassadorBadge, roleLabel } from "@/components/RoleBadge";
import AskQuestionButton from "@/components/AskQuestionButton";

export const metadata: Metadata = {
  title: "Embaixadores",
  description:
    "Conhece os embaixadores da Cadenza — músicos que ajudam a comunidade a crescer todos os dias.",
  alternates: { canonical: "/embaixadores" },
};

export default async function EmbaixadoresPage() {
  const session = await auth();

  const ambassadors = await prisma.user.findMany({
    where: { isAmbassador: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      role: true,
      instrument: true,
      gender: true,
      bio: true,
      avatarUrl: true,
      points: true,
      _count: { select: { posts: true, comments: true } },
    },
    orderBy: { points: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-amber-400/15 via-fuchsia-500/15 to-accent/15 p-6 ring-1 ring-fuchsia-500/30 sm:p-8">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
            Círculo exclusivo
          </span>
        </div>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Sparkles className="h-7 w-7 text-accent" />
          Embaixadores Cadenza
        </h1>
        <p className="mt-2 max-w-2xl text-black/70 dark:text-white/70">
          Um grupo restrito de músicos escolhidos a dedo por representarem o melhor
          da comunidade. Ser embaixador é um distintivo de confiança e mérito — as
          respostas e posts deles ganham destaque em toda a Cadenza.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {["Selecionados a convite", "Distintivo exclusivo", "Destaque no fórum"].map((perk) => (
            <span
              key={perk}
              className="flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 font-medium text-black/70 backdrop-blur dark:bg-white/10 dark:text-white/80"
            >
              <Star className="h-3 w-3 text-amber-500" fill="currentColor" />
              {perk}
            </span>
          ))}
        </div>
      </section>

      {ambassadors.length === 0 ? (
        <p className="text-black/50 dark:text-white/50">
          Ainda não há embaixadores. Volta em breve.
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {ambassadors.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-xl border border-transparent bg-gradient-to-br from-amber-400/10 via-fuchsia-500/10 to-accent/10 p-4 shadow-sm ring-1 ring-fuchsia-500/30 transition-all hover:ring-fuchsia-500/60 hover:shadow-md"
            >
              <Link href={`/perfil/${user.id}`} className="flex items-start gap-3">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size={48} />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {roleLabel(user)}
                  </span>
                  <AmbassadorBadge />
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
    </div>
  );
}
