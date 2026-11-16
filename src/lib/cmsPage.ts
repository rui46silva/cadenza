import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export const pageFields = {
  title: z.string().min(2).max(200),
  slug: z.string().max(80).optional().or(z.literal("")),
  content: z.string().max(100000).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  focusKeyword: z.string().max(80).optional().or(z.literal("")),
  published: z.boolean().optional(),
};

export async function uniquePageSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "pagina";
  let candidate = root;
  let n = 2;
  while (true) {
    const existing = await prisma.cmsPage.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export function pageSnapshot(p: Record<string, unknown>) {
  const keys = ["title", "slug", "content", "metaDescription", "focusKeyword", "published"];
  return Object.fromEntries(keys.map((k) => [k, p[k] ?? null]));
}
