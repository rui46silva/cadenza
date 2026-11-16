import { prisma } from "@/lib/prisma";

type Actor = { user?: { id?: string | null; name?: string | null } | null } | null;

/** Regista uma ação de administração no registo de atividade (nunca lança). */
export async function logActivity(
  session: Actor,
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: session?.user?.id ?? null,
        actorName: session?.user?.name ?? null,
        action,
        entityType,
        entityId,
        summary: summary.slice(0, 300),
      },
    });
  } catch (err) {
    console.error("activity log failed", err);
  }
}
