import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  ids: z.array(z.string()).min(1).max(200),
  action: z.enum(["feature", "unfeature", "expire", "delete"]),
});

export async function POST(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { ids, action } = parsed.data;
  const where = { id: { in: ids } };

  let count = 0;
  if (action === "delete") count = (await prisma.jobListing.deleteMany({ where })).count;
  if (action === "feature") count = (await prisma.jobListing.updateMany({ where, data: { featured: true } })).count;
  if (action === "unfeature") count = (await prisma.jobListing.updateMany({ where, data: { featured: false } })).count;
  if (action === "expire") count = (await prisma.jobListing.updateMany({ where, data: { expiresAt: new Date() } })).count;

  const verbs = { delete: "Eliminou", feature: "Destacou", unfeature: "Removeu destaque de", expire: "Terminou" };
  await logActivity(session, `bulk-${action}`, "job", null, `${verbs[action]} ${count} vaga(s) em massa`);
  return NextResponse.json({ ok: true, count });
}
