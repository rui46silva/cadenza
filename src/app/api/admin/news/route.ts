import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const schema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().max(80).optional().or(z.literal("")),
  summary: z.string().min(2).max(500),
  content: z.string().max(20000).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  source: z.string().max(80).optional().or(z.literal("")),
});

/** Garante um slug único, acrescentando um sufixo numérico se necessário. */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "noticia";
  let candidate = root;
  let n = 2;
  // Continua até encontrar um slug livre (ou pertencente ao próprio artigo).
  while (true) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, slug, summary, content, metaDescription, url, imageUrl, source } = parsed.data;

  const article = await prisma.newsArticle.create({
    data: {
      title,
      slug: await uniqueSlug(slug || title),
      summary,
      content: content || null,
      metaDescription: metaDescription || null,
      url: url || null,
      imageUrl: imageUrl || null,
      source: source || null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}
