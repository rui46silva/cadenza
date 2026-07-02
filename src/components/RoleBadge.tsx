import { BadgeCheck, Sparkles } from "lucide-react";
import { VERIFIABLE_ROLES } from "@/lib/moderation";

type RoleBadgeUser = {
  role: string;
  instrument?: string | null;
  verificationStatus?: string | null;
  isAmbassador?: boolean;
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "border-rose-500 text-rose-600 dark:text-rose-400",
  MODERATOR: "border-violet-500 text-violet-600 dark:text-violet-400",
  PROFESSOR: "border-blue-500 text-blue-600 dark:text-blue-400",
  MUSICO_PROFISSIONAL: "border-amber-500 text-amber-600 dark:text-amber-400",
  ALUNO: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
};

export function roleLabel(user: RoleBadgeUser): string {
  const instrument = user.instrument?.trim();
  if (user.role === "ALUNO") return instrument ? `Aluno de ${instrument}` : "Aluno";
  if (user.role === "PROFESSOR") return instrument ? `Professor de ${instrument}` : "Professor";
  if (user.role === "MUSICO_PROFISSIONAL")
    return instrument ? `Músico profissional de ${instrument}` : "Músico profissional";
  if (user.role === "MODERATOR") return "Moderador";
  return "Admin";
}

function isVerifiableRole(role: string): boolean {
  return (VERIFIABLE_ROLES as readonly string[]).includes(role);
}

export function AmbassadorBadge() {
  return (
    <span
      title="Embaixador Cadenza"
      className="inline-flex items-center gap-1 rounded-full border border-transparent bg-gradient-to-r from-amber-400 via-fuchsia-500 to-accent px-2 py-0.5 text-xs font-semibold text-white shadow-sm"
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
    <span className="inline-flex items-center gap-1">
      {user.isAmbassador && <AmbassadorBadge />}
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-transparent ${
          ROLE_STYLE[user.role] ?? "border-black/20 text-black/60 dark:border-white/20 dark:text-white/60"
        }`}
      >
        {roleLabel(user)}
        {verified && <BadgeCheck className="h-3.5 w-3.5" aria-label="Verificado" />}
      </span>
      {pending && (
        <span className="rounded-full border border-amber-500 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-xs bg-transparent">
          a aguardar verificação
        </span>
      )}
    </span>
  );
}
