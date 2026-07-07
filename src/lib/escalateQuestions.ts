import { prisma } from "@/lib/prisma";
import { expertWhere } from "@/lib/experts";

// Dias que um profissional tem para responder a uma dúvida dirigida antes de ela
// ser aberta a toda a comunidade.
export const ESCALATION_DAYS = 3;

/**
 * Liberta para a comunidade as dúvidas dirigidas que continuam sem resposta ao
 * fim de ESCALATION_DAYS: retira o destinatário (passa a dúvida "normal") e
 * notifica os profissionais/embaixadores do instrumento para a verem na fila.
 *
 * É idempotente: ao limpar `directedToId`, a dúvida deixa de ser candidata.
 */
export async function escalateStaleQuestions(now = new Date()) {
  const cutoff = new Date(now.getTime() - ESCALATION_DAYS * 24 * 60 * 60 * 1000);

  const stale = await prisma.post.findMany({
    where: {
      isQuestion: true,
      bestAnswerId: null,
      directedToId: { not: null },
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      authorId: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (stale.length === 0) return { escalated: 0 };

  // Profissionais/embaixadores por instrumento, para notificar os certos.
  const experts = await prisma.user.findMany({
    where: expertWhere,
    select: { id: true, instrument: true },
  });

  for (const post of stale) {
    await prisma.post.update({
      where: { id: post.id },
      data: { directedToId: null },
    });

    const tagNames = post.tags.map((t) => t.tag.name.toLowerCase());
    const notifyIds = experts
      .filter((e) => {
        const instrument = e.instrument?.trim().toLowerCase();
        return instrument && tagNames.includes(instrument) && e.id !== post.authorId;
      })
      .map((e) => e.id);

    if (notifyIds.length > 0) {
      await prisma.notification.createMany({
        data: notifyIds.map((userId) => ({
          type: "QUESTION" as const,
          userId,
          fromUserId: post.authorId,
          postId: post.id,
        })),
      });
    }
  }

  return { escalated: stale.length };
}
