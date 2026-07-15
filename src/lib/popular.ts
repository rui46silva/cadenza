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
    // Usa a coluna `score` desnormalizada + índice — trivial.
    const top = await prisma.post.findFirst({
      where: { score: { gt: 0 } },
      orderBy: { score: "desc" },
      select: { id: true, score: true },
    });
    return top;
  },
  ["most-popular-post"],
  { revalidate: 30 }
);
