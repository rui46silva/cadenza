import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/forum",
  "/popular",
  "/explorar",
  "/noticias",
  "/regras",
  "/privacidade",
  "/acessibilidade",
  "/login",
  "/register",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const postEntries = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.id}`,
    lastModified: post.updatedAt,
  }));

  return [...staticEntries, ...postEntries];
}
