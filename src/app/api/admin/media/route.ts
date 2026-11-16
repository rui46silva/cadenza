import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  url: z.string().url().refine((u) => /^https?:\/\//i.test(u), "Só URLs http(s)."),
  alt: z.string().max(200).optional().or(z.literal("")),
  title: z.string().max(200).optional().or(z.literal("")),
});

export async function GET(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const items = await prisma.mediaItem.findMany({
    where: q ? { OR: [{ alt: { contains: q, mode: "insensitive" } }, { title: { contains: q, mode: "insensitive" } }, { url: { contains: q } }] } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "URL de imagem inválido." }, { status: 400 });

  const item = await prisma.mediaItem.create({
    data: { url: parsed.data.url, alt: parsed.data.alt || null, title: parsed.data.title || null },
  });
  await logActivity(session, "create", "media", item.id, `Adicionou imagem à biblioteca${item.alt ? `: ${item.alt}` : ""}`);
  return NextResponse.json({ item }, { status: 201 });
}
