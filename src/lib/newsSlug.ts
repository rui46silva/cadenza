import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

/** Slug único para uma notícia (com sufixo numérico se necessário). */
export async function uniqueNewsSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "noticia";
  let candidate = root;
  let n = 2;
  while (true) {
    const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}
