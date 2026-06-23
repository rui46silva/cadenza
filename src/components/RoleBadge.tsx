type RoleBadgeUser = {
  role: string;
  instrument?: string | null;
  verificationStatus?: string | null;
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "border-rose-500 text-rose-600 dark:text-rose-400",
  PROFESSOR: "border-blue-500 text-blue-600 dark:text-blue-400",
  ALUNO: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
};

export function roleLabel(user: RoleBadgeUser): string {
  const instrument = user.instrument?.trim();
  if (user.role === "ALUNO") return instrument ? `Aluno de ${instrument}` : "Aluno";
  if (user.role === "PROFESSOR") return instrument ? `Professor de ${instrument}` : "Professor";
  return "Admin";
}

export default function RoleBadge({ user }: { user: RoleBadgeUser }) {
  const pending = user.role === "PROFESSOR" && user.verificationStatus === "PENDING";

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`rounded-full border px-2 py-0.5 text-xs bg-transparent ${
          ROLE_STYLE[user.role] ?? "border-black/20 text-black/60 dark:border-white/20 dark:text-white/60"
        }`}
      >
        {roleLabel(user)}
      </span>
      {pending && (
        <span className="rounded-full border border-amber-500 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-xs bg-transparent">
          a aguardar verificação
        </span>
      )}
    </span>
  );
}
