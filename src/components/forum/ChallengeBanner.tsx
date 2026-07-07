import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { currentChallenge } from "@/lib/challenges";
import ChallengeCountdown from "@/components/ChallengeCountdown";

/** Banner do desafio da semana, no topo do fórum, com participantes e countdown. */
export default async function ChallengeBanner() {
  const challenge = currentChallenge();
  const participants = await prisma.post.count({
    where: { challengeId: challenge.id },
  });

  return (
    <Link
      href="/desafios"
      className="flex items-center gap-3 rounded-xl border border-accent/40 bg-gradient-to-r from-accent/10 to-transparent px-4 py-3 transition-colors hover:border-accent"
    >
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-2xl"
      >
        {challenge.emoji}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Desafio da semana
        </span>
        <span className="truncate font-medium">{challenge.title}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-black/50 dark:text-white/50">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {participants} participaç{participants === 1 ? "ão" : "ões"}
          </span>
          <ChallengeCountdown endsAt={challenge.endsAt} />
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-black/40 dark:text-white/40" />
    </Link>
  );
}
