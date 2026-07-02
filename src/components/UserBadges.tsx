import { BadgeCheck, Sparkles } from "lucide-react";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import { ROLE_ACCENT_BG, ROLE_ACCENT_BG_FALLBACK } from "@/lib/roleColors";

type BadgeUser = {
  role: string;
  verificationStatus?: string | null;
  isAmbassador?: boolean;
};

function isVerifiableRole(role: string): boolean {
  return (VERIFIABLE_ROLES as readonly string[]).includes(role);
}

/**
 * Versão compacta dos badges de utilizador — só ícones, sem pastilhas de texto.
 * Pensada para contextos apertados (comentários, listas de posts, navbar), onde
 * o RoleBadge completo (com o papel e as pastilhas) ocupa demasiado espaço.
 */
export default function UserBadges({ user }: { user: BadgeUser }) {
  const verified = isVerifiableRole(user.role) && user.verificationStatus === "APPROVED";

  if (!user.isAmbassador && !verified) return null;

  return (
    <span className="inline-flex items-center gap-0.5">
      {user.isAmbassador && (
        <span
          title="Embaixador Cadenza"
          className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-fuchsia-500 to-accent text-white"
        >
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      )}
      {verified && (
        <span
          title="Verificado"
          className={`flex h-4 w-4 items-center justify-center rounded-full text-white ${
            ROLE_ACCENT_BG[user.role] ?? ROLE_ACCENT_BG_FALLBACK
          }`}
        >
          <BadgeCheck className="h-2.5 w-2.5" />
        </span>
      )}
    </span>
  );
}
