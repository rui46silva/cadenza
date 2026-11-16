import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { pageFields, uniquePageSlug, pageSnapshot } from "@/lib/cmsPage";
import { saveRevision } from "@/lib/revisions";
import { logActivity } from "@/lib/activity";

const schema = z.object(pageFields).partial();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;
  const before = await prisma.cmsPage.findUnique({ where: { id }, select: { title: true, published: true } });
  if (!before) return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (d.title !== undefined) data.title = d.title;
  if (d.content !== undefined) data.content = d.content ?? "";
  if (d.metaDescription !== undefined) data.metaDescription = d.metaDescription || null;
  if (d.focusKeyword !== undefined) data.focusKeyword = d.focusKeyword || null;
  if (d.published !== undefined) data.published = d.published;
  if (d.slug !== undefined) data.slug = await uniquePageSlug(d.slug || d.title || before.title, id);

  const page = await prisma.cmsPage.update({ where: { id }, data });
  if (Object.keys(data).some((k) => k !== "published")) await saveRevision("page", id, pageSnapshot(page), session);
  const verb =
    d.published !== undefined && d.published !== before.published ? (d.published ? "Publicou" : "Despublicou") : "Editou";
  await logActivity(session, verb === "Editou" ? "update" : verb === "Publicou" ? "publish" : "unpublish", "page", id, `${verb} a página "${page.title}"`);
  return NextResponse.json({ page });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { id } = await params;
  const page = await prisma.cmsPage.delete({ where: { id } }).catch(() => null);
  if (page) await logActivity(session, "delete", "page", id, `Eliminou a página "${page.title}"`);
  return NextResponse.json({ ok: true });
}
