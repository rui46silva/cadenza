import { prisma } from "@/lib/prisma";

export const POINTS = {
  POST_CREATED: 10,
  COMMENT_CREATED: 3,
  UPVOTE_RECEIVED: 2,
} as const;

export async function awardPoints(userId: string, amount: number) {
  if (amount === 0) return;
  await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: amount } },
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
