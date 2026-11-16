import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { uniqueNewsSlug } from "@/lib/newsSlug";
import { newsFields, parsePublishedAt, newsSnapshot } from "@/lib/newsSchema";
import { saveRevision } from "@/lib/revisions";
import { logActivity } from "@/lib/activity";

const schema = z.object(newsFields).partial();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const before = await prisma.newsArticle.findUnique({ where: { id }, select: { published: true, title: true } });
  if (!before) return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (d.title !== undefined) data.title = d.title;
  if (d.summary !== undefined) data.summary = d.summary;
  for (const k of ["content", "metaDescription", "focusKeyword", "category", "url", "imageUrl", "source"] as const) {
    if (d[k] !== undefined) data[k] = d[k] || null;
  }
  if (d.published !== undefined) data.published = d.published;
  if (d.publishedAt !== undefined) {
    const at = parsePublishedAt(d.publishedAt);
    if (at) data.publishedAt = at;
  }
  if (d.slug !== undefined) data.slug = await uniqueNewsSlug(d.slug || d.title || before.title, id);

  const article = await prisma.newsArticle.update({ where: { id }, data });

  // Só criamos revisão quando há alterações de conteúdo (não num simples publicar/despublicar).
  const contentChanged = Object.keys(data).some((k) => k !== "published");
  if (contentChanged) await saveRevision("news", id, newsSnapshot(article), session);

  const action =
    d.published !== undefined && d.published !== before.published
      ? d.published ? "publish" : "unpublish"
      : "update";
  const verb = action === "publish" ? "Publicou" : action === "unpublish" ? "Despublicou" : "Editou";
  await logActivity(session, action, "news", id, `${verb} a notícia "${article.title}"`);

  return NextResponse.json({ article });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const article = await prisma.newsArticle.delete({ where: { id } }).catch(() => null);
  if (article) {
    await logActivity(session, "delete", "news", id, `Eliminou a notícia "${article.title}"`);
  }
  return NextResponse.json({ ok: true });
}
