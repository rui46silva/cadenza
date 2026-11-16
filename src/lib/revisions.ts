import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type RevisionEntity = "news" | "job" | "page";

const MAX_REVISIONS = 30;

/** Guarda uma versão do conteúdo e mantém apenas as últimas MAX_REVISIONS. */
export async function saveRevision(
  entityType: RevisionEntity,
  entityId: string,
  data: Record<string, unknown>,
  session: { user?: { id?: string | null; name?: string | null } | null } | null
) {
  try {
    await prisma.contentRevision.create({
      data: {
        entityType,
        entityId,
        data: JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue,
        authorId: session?.user?.id ?? null,
        authorName: session?.user?.name ?? null,
      },
    });
    const old = await prisma.contentRevision.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      skip: MAX_REVISIONS,
      select: { id: true },
    });
    if (old.length) {
      await prisma.contentRevision.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
    }
  } catch (err) {
    console.error("save revision failed", err);
  }
}
