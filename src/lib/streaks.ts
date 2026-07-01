import { prisma } from "@/lib/prisma";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(a: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(a, yesterday);
}

/**
 * Atualiza a streak de dias consecutivos do utilizador, no máximo uma vez por dia.
 * Devolve a streak atual (já atualizada, se aplicável).
 */
export async function touchStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveAt: true },
  });
  if (!user) return 0;

  const now = new Date();
  if (user.lastActiveAt && isSameDay(user.lastActiveAt, now)) {
    return user.currentStreak;
  }

  const nextStreak =
    user.lastActiveAt && isYesterday(user.lastActiveAt, now) ? user.currentStreak + 1 : 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: nextStreak,
      longestStreak: Math.max(nextStreak, user.longestStreak),
      lastActiveAt: now,
    },
  });

  return nextStreak;
}
