import { BadgeCheck, Sparkles, Crown } from "lucide-react";
import { VERIFIABLE_ROLES } from "@/lib/moderation";
import { PREMIUM_ENABLED } from "@/lib/features";
import { ROLE_PILL_STYLE, ROLE_PILL_STYLE_FALLBACK } from "@/lib/roleColors";

type RoleBadgeUser = {
  role: string;
  instrument?: string | null;
  verificationStatus?: string | null;
  isAmbassador?: boolean | null;
  isPremium?: boolean | null;
  gender?: string | null;
};

/** Escolhe a forma masculina ou feminina conforme o género do utilizador. */
function gendered(user: RoleBadgeUser, masc: string, fem: string): string {
  return user.gender === "FEMININO" ? fem : masc;
}

export function roleLabel(user: RoleBadgeUser): string {
  const instrument = user.instrument?.trim();
  if (user.role === "ALUNO") {
    const base = gendered(user, "Aluno", "Aluna");
    return instrument ? `${base} de ${instrument}` : base;
  }
  if (user.role === "PROFESSOR") {
    const base = gendered(user, "Professor", "Professora");
    return instrument ? `${base} de ${instrument}` : base;
  }
  if (user.role === "MUSICO_PROFISSIONAL") {
    // "Músico profissional" é unissexo — não tem forma feminina.
    const base = "Músico profissional";
    return instrument ? `${base} de ${instrument}` : base;
  }
  if (user.role === "MODERATOR") return gendered(user, "Moderador", "Moderadora");
  return "Admin";
}

function isVerifiableRole(role: string): boolean {
  return (VERIFIABLE_ROLES as readonly string[]).includes(role);
}

export function PremiumBadge() {
  return (
    <span
      title="Membro Premium"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-transparent bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
    >
      <Crown className="h-3.5 w-3.5" />
      Premium
    </span>
  );
}

export function AmbassadorBadge() {
  return (
    <span
      title="Embaixador Cadenza"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-transparent bg-gradient-to-r from-amber-400 via-fuchsia-500 to-accent px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Embaixador
    </span>
  );
}

export default function RoleBadge({ user }: { user: RoleBadgeUser }) {
  const verifiable = isVerifiableRole(user.role);
  const pending = verifiable && user.verificationStatus === "PENDING";
  const verified = verifiable && user.verificationStatus === "APPROVED";

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {user.isAmbassador && <AmbassadorBadge />}
      {user.isPremium && <PremiumBadge />}
      <span
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs bg-transparent ${
          ROLE_PILL_STYLE[user.role] ?? ROLE_PILL_STYLE_FALLBACK
        }`}
      >
        {roleLabel(user)}
        {verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-label="Verificado" />}
      </span>
      {pending && (
        <span className="whitespace-nowrap rounded-full border border-amber-500 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-xs bg-transparent">
          a aguardar verificação
        </span>
      )}
    </span>
  );
}
