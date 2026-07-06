import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, FileText, MessageSquare } from "lucide-react";
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
    where: { isAmbassador: true },
    select: {
      id: true,
      name: true,
      role: true,
      instrument: true,
      bio: true,
      avatarUrl: true,
      points: true,
      _count: { select: { posts: true, comments: true } },
    },
    orderBy: { points: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-accent" />
          Embaixadores
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Músicos que se destacam a ajudar a comunidade Cadenza — as respostas e
          posts deles ganham destaque no fórum.
        </p>
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
              className="flex flex-col gap-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-4 transition-colors hover:border-fuchsia-500/60"
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
                {session?.user && session.user.id !== user.id && (
                  <AskQuestionButton expertId={user.id} />
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
