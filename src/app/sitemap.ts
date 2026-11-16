import { publicNewsWhere } from "@/lib/newsSchema";
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/forum",
  "/popular",
  "/explorar",
  "/noticias",
  "/vagas",
  "/regras",
  "/privacidade",
  "/acessibilidade",
  "/login",
  "/register",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, articles, tags, jobs, cmsPages] = await Promise.all([
    prisma.post.findMany({
      select: { id: true, slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.newsArticle.findMany({
      where: publicNewsWhere(),
      select: { id: true, slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    // Só tags com pelo menos um post (evita páginas vazias no índice).
    prisma.tag.findMany({
      where: { posts: { some: {} } },
      select: { name: true },
    }),
    prisma.jobListing.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { id: true, slug: true, updatedAt: true },
    }),
    prisma.cmsPage.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const postEntries = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug ?? post.id}`,
    lastModified: post.updatedAt,
  }));

  const newsEntries = articles.map((a) => ({
    url: `${siteUrl}/noticias/${a.slug ?? a.id}`,
    lastModified: a.updatedAt,
  }));

  const tagEntries = tags.map((t) => ({
    url: `${siteUrl}/t/${encodeURIComponent(t.name)}`,
    lastModified: new Date(),
  }));

  const jobEntries = jobs.map((j) => ({
    url: `${siteUrl}/vagas/${j.slug ?? j.id}`,
    lastModified: j.updatedAt,
  }));

  const pageEntries = cmsPages.map((p) => ({ url: `${siteUrl}/p/${p.slug}`, lastModified: p.updatedAt }));

  return [...staticEntries, ...postEntries, ...newsEntries, ...tagEntries, ...jobEntries, ...pageEntries];
}
