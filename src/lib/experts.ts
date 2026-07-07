import type { Prisma } from "@prisma/client";
import { VERIFIABLE_ROLES } from "@/lib/moderation";

/**
 * "Especialistas" a quem se pode dirigir uma dúvida: professores certificados
 * e músicos profissionais verificados, mais os embaixadores. São as contas com
 * o botão "Tirar dúvida" no perfil e nas páginas dedicadas.
 */
export type ExpertUser = {
  role: string;
  verificationStatus?: string | null;
  isAmbassador?: boolean | null;
};

export function isExpert(user: ExpertUser): boolean {
  const verifiedPro =
    (VERIFIABLE_ROLES as readonly string[]).includes(user.role) &&
    user.verificationStatus === "APPROVED";
  return verifiedPro || Boolean(user.isAmbassador);
}

/** Cláusula Prisma para encontrar todos os especialistas. */
export const expertWhere: Prisma.UserWhereInput = {
  OR: [
    { role: { in: [...VERIFIABLE_ROLES] }, verificationStatus: "APPROVED" },
    { isAmbassador: true },
  ],
};
