import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  ids: z.array(z.string()).min(1).max(200),
  action: z.enum(["publish", "unpublish", "delete"]),
});

export async function POST(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { ids, action } = parsed.data;
  const where = { id: { in: ids } };
  const count =
    action === "delete"
      ? (await prisma.cmsPage.deleteMany({ where })).count
      : (await prisma.cmsPage.updateMany({ where, data: { published: action === "publish" } })).count;
  const verb = action === "delete" ? "Eliminou" : action === "publish" ? "Publicou" : "Despublicou";
  await logActivity(session, `bulk-${action}`, "page", null, `${verb} ${count} página(s) em massa`);
  return NextResponse.json({ ok: true, count });
}
