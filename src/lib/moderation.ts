import type { InfractionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const INFRACTION_LABELS: Record<InfractionType, string> = {
  SPAM: "Spam ou autopromoção excessiva",
  DISCURSO_ODIO: "Discurso de ódio ou assédio",
  ASSEDIO: "Ataques pessoais",
  DIREITOS_AUTOR: "Violação de direitos de autor",
  CONTEUDO_INAPROPRIADO: "Conteúdo inapropriado ou irrelevante",
  OUTRO: "Outra infração",
};

export const INFRACTION_ORDER: InfractionType[] = [
  "SPAM",
  "DISCURSO_ODIO",
  "ASSEDIO",
  "DIREITOS_AUTOR",
  "CONTEUDO_INAPROPRIADO",
  "OUTRO",
];

// Duração sugerida, em dias, para cada infração. `null` = banimento permanente.
export const INFRACTION_SUGGESTED_DAYS: Record<InfractionType, number | null> = {
  SPAM: 7,
  DISCURSO_ODIO: 30,
  ASSEDIO: 30,
  DIREITOS_AUTOR: 14,
  CONTEUDO_INAPROPRIADO: 7,
  OUTRO: 7,
};

export function isStaff(role?: string | null): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

// Papéis cuja conta exige verificação manual por um admin antes de ficar aprovada.
export const VERIFIABLE_ROLES = ["PROFESSOR", "MUSICO_PROFISSIONAL"] as const;

export function requiresVerification(role?: string | null): boolean {
  return (VERIFIABLE_ROLES as readonly string[]).includes(role ?? "");
}

export async function getActiveBan(userId: string) {
  return prisma.ban.findFirst({
    where: {
      userId,
      liftedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });
}
