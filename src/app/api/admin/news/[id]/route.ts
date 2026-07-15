import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const schema = z.object({
  published: z.boolean().optional(),
  title: z.string().min(2).max(200).optional(),
  slug: z.string().max(80).optional().or(z.literal("")),
  summary: z.string().min(2).max(500).optional(),
  content: z.string().max(20000).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  source: z.string().max(80).optional().or(z.literal("")),
});

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  const root = slugify(base) || "noticia";
  let candidate = root;
  let n = 2;
  while (true) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.published !== undefined) data.published = d.published;
  if (d.title !== undefined) data.title = d.title;
  if (d.summary !== undefined) data.summary = d.summary;
  if (d.content !== undefined) data.content = d.content || null;
  if (d.metaDescription !== undefined) data.metaDescription = d.metaDescription || null;
  if (d.url !== undefined) data.url = d.url || null;
  if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl || null;
  if (d.source !== undefined) data.source = d.source || null;
  // Se enviaram um slug (mesmo que vazio), regeneramos garantindo unicidade.
  if (d.slug !== undefined) {
    data.slug = await uniqueSlug(d.slug || d.title || "noticia", id);
  }

  const article = await prisma.newsArticle.update({ where: { id }, data });

  return NextResponse.json({ article });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.newsArticle.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
