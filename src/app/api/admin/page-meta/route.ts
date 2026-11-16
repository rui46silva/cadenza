import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  path: z.string().min(1).max(200),
  title: z.string().max(200).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  focusKeyword: z.string().max(80).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { path, title, metaDescription, focusKeyword } = parsed.data;

  const meta = await prisma.pageMeta.upsert({
    where: { path },
    create: {
      path,
      title: title || null,
      metaDescription: metaDescription || null,
      focusKeyword: focusKeyword || null,
    },
    update: {
      title: title || null,
      metaDescription: metaDescription || null,
      focusKeyword: focusKeyword || null,
    },
  });

  await logActivity(session, "update", "seo", path, `Atualizou o SEO da página ${path}`);
  return NextResponse.json({ meta });
}
