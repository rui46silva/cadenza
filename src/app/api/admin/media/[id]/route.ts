import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  alt: z.string().max(200).optional().or(z.literal("")),
  title: z.string().max(200).optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const item = await prisma.mediaItem.update({
    where: { id },
    data: { alt: parsed.data.alt || null, title: parsed.data.title || null },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { id } = await params;
  await prisma.mediaItem.delete({ where: { id } }).catch(() => null);
  await logActivity(session, "delete", "media", id, "Removeu uma imagem da biblioteca");
  return NextResponse.json({ ok: true });
}
