import Link from "next/link";
import { prisma } from "@/lib/prisma";

const SITEMAP_LINKS = [
  { href: "/forum", label: "Fórum" },
  { href: "/popular", label: "Popular" },
  { href: "/explorar", label: "Explorar" },
  { href: "/regras", label: "Regras do fórum" },
  { href: "/privacidade", label: "Política de privacidade" },
  { href: "/acessibilidade", label: "Acessibilidade" },
];

export default async function RightSidebar() {
  const topTags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: 8,
  });

  return (
    <div className="flex flex-col gap-6 text-sm">
      <section>
        <h2 className="mb-2 font-semibold text-black/70 dark:text-white/70">
          Comunidades populares
        </h2>
        <ul className="flex flex-col gap-1">
          {topTags.length === 0 && (
            <li className="text-black/40 dark:text-white/40">
              Ainda não há comunidades.
            </li>
          )}
          {topTags.map((tag) => (
            <li key={tag.id}>
              <Link
                href={`/forum?tag=${encodeURIComponent(tag.name)}`}
                className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span>#{tag.name}</span>
                <span className="text-black/40 dark:text-white/40 text-xs">
                  {tag._count.posts}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-auto border-t border-black/10 dark:border-white/10 pt-4">
        <h2 className="mb-2 font-semibold text-black/70 dark:text-white/70">
          Sitemap
        </h2>
        <ul className="flex flex-col gap-1">
          {SITEMAP_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-md px-2 py-1 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
