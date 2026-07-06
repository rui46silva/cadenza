import Link from "next/link";
import type { Metadata } from "next";
import { GraduationCap, FileText, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import Avatar from "@/components/Avatar";
import RoleBadge from "@/components/RoleBadge";
import AskQuestionButton from "@/components/AskQuestionButton";

export const metadata: Metadata = {
  title: "Professores e profissionais",
  description:
    "Diretório de professores certificados e músicos profissionais verificados da Cadenza — tira as tuas dúvidas diretamente com eles.",
  alternates: { canonical: "/professores" },
};

export default async function ProfessoresPage() {
  const session = await auth();

  const pros = await prisma.user.findMany({
    where: {
      role: { in: [...VERIFIABLE_ROLES] },
      verificationStatus: "APPROVED",
    },
    select: {
      id: true,
      name: true,
      role: true,
      instrument: true,
      bio: true,
      avatarUrl: true,
      isAmbassador: true,
      verificationStatus: true,
      points: true,
      _count: { select: { posts: true, comments: true } },
    },
    orderBy: { points: "desc" },
  });

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
              className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/10 p-4 transition-colors hover:border-accent/60"
            >
              <Link href={`/perfil/${user.id}`} className="flex items-start gap-3">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size={48} />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold">{user.name}</span>
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
                {session?.user && session.user.id !== user.id && (
                  <AskQuestionButton expertId={user.id} />
                )}
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
