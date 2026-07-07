import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { currentChallenge } from "@/lib/challenges";

/** Banner compacto do desafio da semana, no topo do fórum. */
export default function ChallengeBanner() {
  const challenge = currentChallenge();
  return (
    <Link
      href="/desafios"
      className="flex items-center gap-3 rounded-xl border border-accent/40 bg-gradient-to-r from-accent/10 to-transparent px-4 py-3 transition-colors hover:border-accent"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Trophy className="h-5 w-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Desafio da semana
        </span>
        <span className="truncate font-medium">{challenge.title}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-black/40 dark:text-white/40" />
    </Link>
  );
}
