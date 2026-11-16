import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { uniqueNewsSlug } from "@/lib/newsSlug";
import { newsFields, parsePublishedAt, newsSnapshot } from "@/lib/newsSchema";
import { saveRevision } from "@/lib/revisions";
import { logActivity } from "@/lib/activity";

const schema = z.object(newsFields);

export async function POST(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const article = await prisma.newsArticle.create({
    data: {
      title: d.title,
      slug: await uniqueNewsSlug(d.slug || d.title),
      summary: d.summary,
      content: d.content || null,
      metaDescription: d.metaDescription || null,
      focusKeyword: d.focusKeyword || null,
      category: d.category || null,
      url: d.url || null,
      imageUrl: d.imageUrl || null,
      source: d.source || null,
      published: d.published ?? true,
      publishedAt: parsePublishedAt(d.publishedAt) ?? new Date(),
      createdById: session.user.id,
    },
  });

  await saveRevision("news", article.id, newsSnapshot(article), session);
  await logActivity(session, article.published ? "publish" : "create", "news", article.id, `Criou a notícia "${article.title}"${article.published ? "" : " (rascunho)"}`);

  return NextResponse.json({ article }, { status: 201 });
}
