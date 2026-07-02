export const ROLE_PILL_STYLE: Record<string, string> = {
  ADMIN: "border-rose-500 text-rose-600 dark:text-rose-400",
  MODERATOR: "border-violet-500 text-violet-600 dark:text-violet-400",
  PROFESSOR: "border-blue-500 text-blue-600 dark:text-blue-400",
  MUSICO_PROFISSIONAL: "border-amber-500 text-amber-600 dark:text-amber-400",
  ALUNO: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
};

export const ROLE_PILL_STYLE_FALLBACK =
  "border-black/20 text-black/60 dark:border-white/20 dark:text-white/60";

/** Fundo sólido correspondente à cor de cada papel, usado nos badges compactos. */
export const ROLE_ACCENT_BG: Record<string, string> = {
  ADMIN: "bg-rose-500",
  MODERATOR: "bg-violet-500",
  PROFESSOR: "bg-blue-500",
  MUSICO_PROFISSIONAL: "bg-amber-500",
  ALUNO: "bg-emerald-500",
};

export const ROLE_ACCENT_BG_FALLBACK = "bg-black/40 dark:bg-white/40";
