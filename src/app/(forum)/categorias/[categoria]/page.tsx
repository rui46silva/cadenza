import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LayoutGrid } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  isTagCategory,
} from "@/lib/tagCategories";
import { pill } from "@/lib/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const category = categoria.toUpperCase();
  if (!isTagCategory(category)) return {};

  return {
    title: CATEGORY_LABELS[category],
    description: CATEGORY_DESCRIPTIONS[category],
    alternates: { canonical: `/categorias/${categoria}` },
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = categoria.toUpperCase();

  if (!isTagCategory(category)) notFound();

  const tags = await prisma.tag.findMany({
    where: { category },
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <section>
        <Link
          href="/categorias"
          className="text-sm text-black/50 dark:text-white/50 hover:text-accent"
        >
          ← Categorias
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold mt-1">
          <LayoutGrid className="h-6 w-6 text-accent" />
          {CATEGORY_LABELS[category]}
        </h1>
        <p className="text-black/60 dark:text-white/60">
          {CATEGORY_DESCRIPTIONS[category]}
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <p className="text-black/50 dark:text-white/50">
            Ainda não há temas nesta categoria.
          </p>
        )}
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/forum?tag=${encodeURIComponent(tag.name)}`}
            className={pill}
          >
            #{tag.name} ({tag._count.posts})
          </Link>
        ))}
      </div>
    </div>
  );
}
