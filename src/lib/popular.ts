import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * O post mais popular do fórum = o que tem o maior saldo de votos (UP - DOWN)
 * de todos, sem qualquer limiar fixo. É recalculado sobre todos os posts, por
 * iso quando um post ultrapassa o atual líder passa a ser ele o "mais popular".
 *
 * A contagem é feita por agregação na base de dados (rápida) e guardada em
 * cache por 30s para não repetir a conta em cada visita.
 */
export const getMostPopularPostId = unstable_cache(
  async (): Promise<{ id: string; score: number } | null> => {
    const [ups, downs] = await Promise.all([
      prisma.postVote.groupBy({
        by: ["postId"],
        where: { value: "UP" },
        _count: { _all: true },
      }),
      prisma.postVote.groupBy({
        by: ["postId"],
        where: { value: "DOWN" },
        _count: { _all: true },
      }),
    ]);

    const scores = new Map<string, number>();
    for (const u of ups) scores.set(u.postId, (scores.get(u.postId) ?? 0) + u._count._all);
    for (const d of downs) scores.set(d.postId, (scores.get(d.postId) ?? 0) - d._count._all);

    let top: { id: string; score: number } | null = null;
    for (const [id, score] of scores) {
      if (!top || score > top.score) top = { id, score };
    }
    // Só há "mais popular" se houver de facto votos positivos líquidos.
    return top && top.score > 0 ? top : null;
  },
  ["most-popular-post"],
  { revalidate: 30 }
);
