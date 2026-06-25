import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_DESCRIPTIONS,
} from "@/lib/tagCategories";
import { card } from "@/lib/ui";

export const metadata = {
  title: "Categorias",
};

export default async function CategoriasPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <LayoutGrid className="h-6 w-6 text-accent" />
          Categorias
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Explora os temas do fórum organizados por categoria.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORY_ORDER.map((category) => {
          const categoryTags = tags.filter((t) => t.category === category);
          const postCount = categoryTags.reduce(
            (acc, t) => acc + t._count.posts,
            0
          );
          return (
            <Link
              key={category}
              href={`/categorias/${category.toLowerCase()}`}
              className={`${card} flex flex-col gap-2 hover:border-accent/60 transition-colors`}
            >
              <span className="font-semibold">{CATEGORY_LABELS[category]}</span>
              <span className="text-sm text-black/60 dark:text-white/60">
                {CATEGORY_DESCRIPTIONS[category]}
              </span>
              <span className="text-xs text-black/40 dark:text-white/40">
                {categoryTags.length} temas · {postCount} posts
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
