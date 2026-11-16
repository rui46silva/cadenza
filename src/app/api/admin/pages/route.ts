import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { pageFields, uniquePageSlug, pageSnapshot } from "@/lib/cmsPage";
import { saveRevision } from "@/lib/revisions";
import { logActivity } from "@/lib/activity";

const schema = z.object(pageFields);

export async function POST(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  const page = await prisma.cmsPage.create({
    data: {
      title: d.title,
      slug: await uniquePageSlug(d.slug || d.title),
      content: d.content ?? "",
      metaDescription: d.metaDescription || null,
      focusKeyword: d.focusKeyword || null,
      published: d.published ?? false,
    },
  });
  await saveRevision("page", page.id, pageSnapshot(page), session);
  await logActivity(session, "create", "page", page.id, `Criou a página "${page.title}"`);
  return NextResponse.json({ page }, { status: 201 });
}
