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

/** Instantâneo dos campos de uma vaga para guardar como revisão. */
export function jobSnapshot(j: Record<string, unknown>) {
  const keys = ["title", "slug", "organization", "location", "type", "instrument", "description", "metaDescription", "focusKeyword", "applyUrl", "contactEmail", "expiresAt", "featured"];
  return Object.fromEntries(keys.map((k) => [k, j[k] ?? null]));
}
