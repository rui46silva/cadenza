import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";

export async function GET(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const sp = new URL(req.url).searchParams;
  const entityType = sp.get("entityType");
  const entityId = sp.get("entityId");
  if (!entityType || !entityId) return NextResponse.json({ items: [] });

  const items = await prisma.contentRevision.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, createdAt: true, authorName: true, data: true },
  });
  return NextResponse.json({ items });
}
