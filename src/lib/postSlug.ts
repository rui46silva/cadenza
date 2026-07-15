import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

/** Gera um slug único para um post a partir do título (com sufixo se necessário). */
export async function uniquePostSlug(title: string, excludeId?: string): Promise<string> {
  const root = slugify(title) || "post";
  let candidate = root;
  let n = 2;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}
