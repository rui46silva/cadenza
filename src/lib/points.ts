import { prisma } from "@/lib/prisma";

export const POINTS = {
  POST_CREATED: 10,
  COMMENT_CREATED: 3,
  UPVOTE_RECEIVED: 2,
  BEST_ANSWER: 15,
} as const;

/** Período mensal atual, ex: "2026-07". Base para o ranking do mês. */
export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function awardPoints(userId: string, amount: number) {
  if (amount === 0) return;

  const period = currentPeriod();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyPeriod: true },
  });
  if (!user) return;

  // Ao mudar de mês, o contador mensal reinicia antes de somar.
  const samePeriod = user.monthlyPeriod === period;

  await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: amount },
      monthlyPeriod: period,
      monthlyPoints: samePeriod ? { increment: amount } : Math.max(0, amount),
    },
  });
}

export function pointsForVoteValue(value: "UP" | "DOWN" | null): number {
  return value === "UP" ? POINTS.UPVOTE_RECEIVED : 0;
}

export function levelForPoints(points: number) {
  let level = 1;
  let threshold = 50;
  let remaining = points;

  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold += 50;
  }

  return {
    level,
    pointsIntoLevel: remaining,
    pointsForNextLevel: threshold,
    progress: remaining / threshold,
  };
}
