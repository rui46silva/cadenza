import Link from "next/link";
import { Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AdSlot from "@/components/AdSlot";

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

  const topUsers = await prisma.user.findMany({
    where: { points: { gt: 0 } },
    orderBy: { points: "desc" },
    take: 5,
    select: { id: true, name: true, points: true },
  });

  return (
    <div className="flex flex-col gap-6 text-sm">
      {topUsers.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 font-semibold text-black/70 dark:text-white/70">
            <Trophy className="h-4 w-4 text-accent" />
            Top da comunidade
          </h2>
          <ul className="flex flex-col gap-1">
            {topUsers.map((u, i) => (
              <li key={u.id}>
                <Link
                  href={`/perfil/${u.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-black/40 dark:text-white/40 w-4 shrink-0">
                      {i + 1}
                    </span>
                    <span className="truncate">{u.name}</span>
                  </span>
                  <span className="text-black/40 dark:text-white/40 text-xs shrink-0">
                    {u.points} pts
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

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

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} />

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
