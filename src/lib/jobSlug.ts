import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

/** Gera um slug único para uma vaga a partir do título. */
export async function uniqueJobSlug(title: string, excludeId?: string): Promise<string> {
  const root = slugify(title) || "vaga";
  let candidate = root;
  let n = 2;
  while (true) {
    const existing = await prisma.jobListing.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}
