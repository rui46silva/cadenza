import { z } from "zod";

// Campos editáveis de uma notícia no CMS (todos opcionais para o PATCH).
export const newsFields = {
  title: z.string().min(2).max(200),
  slug: z.string().max(80).optional().or(z.literal("")),
  summary: z.string().min(2).max(500),
  content: z.string().max(50000).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  focusKeyword: z.string().max(80).optional().or(z.literal("")),
  category: z.string().max(60).optional().or(z.literal("")),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  source: z.string().max(80).optional().or(z.literal("")),
  published: z.boolean().optional(),
  // Data de publicação (ISO). No futuro + publicada = agendada.
  publishedAt: z.string().optional().or(z.literal("")),
};

export function parsePublishedAt(v?: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Instantâneo dos campos para guardar como revisão. */
export function newsSnapshot(a: Record<string, unknown>) {
  const keys = ["title", "slug", "summary", "content", "metaDescription", "focusKeyword", "category", "url", "imageUrl", "source", "published", "publishedAt"];
  return Object.fromEntries(keys.map((k) => [k, a[k] ?? null]));
}

export type NewsStatus = "draft" | "scheduled" | "published";

/** Estado editorial de uma notícia: rascunho, agendada ou publicada. */
export function newsStatus(a: { published: boolean; publishedAt: Date | string }): NewsStatus {
  if (!a.published) return "draft";
  return new Date(a.publishedAt).getTime() > Date.now() ? "scheduled" : "published";
}

/** Filtro Prisma para notícias visíveis ao público (publicadas e já na data). */
export function publicNewsWhere() {
  return { published: true, publishedAt: { lte: new Date() } };
}
