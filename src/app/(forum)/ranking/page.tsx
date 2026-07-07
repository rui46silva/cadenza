import Link from "next/link";
import type { Metadata } from "next";
import { Trophy, Medal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { currentPeriod } from "@/lib/points";
import { levelInfo } from "@/lib/levels";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = {
  title: "Ranking",
  description: "O ranking da comunidade Cadenza — do mês e de sempre.",
  alternates: { canonical: "/ranking" },
};

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function medalColor(rank: number) {
  if (rank === 0) return "text-amber-500";
  if (rank === 1) return "text-slate-400";
  if (rank === 2) return "text-orange-700 dark:text-orange-500";
  return "text-black/30 dark:text-white/30";
}

function RankList({
  users,
  metric,
}: {
  users: { id: string; name: string; avatarUrl: string | null; value: number; points: number }[];
  metric: string;
}) {
  if (users.length === 0) {
    return <p className="text-sm text-black/50 dark:text-white/50">Ainda sem ranking.</p>;
  }
  return (
    <ol className="flex flex-col gap-1">
      {users.map((u, i) => (
        <li key={u.id}>
          <Link
            href={`/perfil/${u.id}`}
            className="flex items-center gap-3 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 hover:border-accent/60"
          >
            <span className={`w-6 shrink-0 text-center font-bold tabular-nums ${medalColor(i)}`}>
              {i < 3 ? <Medal className="mx-auto h-4 w-4" /> : i + 1}
            </span>
            <Avatar name={u.name} avatarUrl={u.avatarUrl} size={32} />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate font-medium">{u.name}</span>
              <span className="text-xs text-black/40 dark:text-white/40">
                Nível {levelInfo(u.points).level} · {levelInfo(u.points).title}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-accent">
              {u.value} {metric}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function RankingPage() {
  const period = currentPeriod();
  const monthName = MONTH_NAMES[new Date().getMonth()];

  const [monthly, allTime] = await Promise.all([
    prisma.user.findMany({
      where: { monthlyPeriod: period, monthlyPoints: { gt: 0 } },
      orderBy: { monthlyPoints: "desc" },
      take: 20,
      select: { id: true, name: true, avatarUrl: true, monthlyPoints: true, points: true },
    }),
    prisma.user.findMany({
      where: { points: { gt: 0 } },
      orderBy: { points: "desc" },
      take: 20,
      select: { id: true, name: true, avatarUrl: true, points: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Trophy className="h-6 w-6 text-accent" />
          Ranking
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Ganhas pontos ao publicar, comentar, receber votos e resolver dúvidas.
          O ranking do mês reinicia a cada mês — todos têm uma nova hipótese.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold capitalize">Top de {monthName}</h2>
        <RankList
          users={monthly.map((u) => ({
            id: u.id,
            name: u.name,
            avatarUrl: u.avatarUrl,
            value: u.monthlyPoints,
            points: u.points,
          }))}
          metric="pts"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">De sempre</h2>
        <RankList
          users={allTime.map((u) => ({
            id: u.id,
            name: u.name,
            avatarUrl: u.avatarUrl,
            value: u.points,
            points: u.points,
          }))}
          metric="pts"
        />
      </section>
    </div>
  );
}
