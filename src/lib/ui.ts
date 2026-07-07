export const buttonPrimary =
  "rounded-md bg-accent text-accent-foreground px-5 py-2.5 font-medium shadow-sm transition-all hover:shadow-md hover:brightness-110 active:brightness-95";

export const buttonPrimarySm =
  "rounded-md bg-accent text-accent-foreground px-3 py-1.5 text-sm font-medium shadow-sm transition-all hover:shadow-md hover:brightness-110 active:brightness-95";

export const buttonOutline =
  "rounded-md border border-black/15 dark:border-white/20 px-5 py-2.5 font-medium transition-colors hover:border-accent hover:text-accent";

export const buttonOutlineSm =
  "rounded-md border border-accent text-accent px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent/10";

export const pill =
  "rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent";

export const pillActive =
  "rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium";

export const card =
  "rounded-lg border border-black/10 dark:border-white/10 p-5 transition-colors hover:border-accent/60";

/**
 * Estilo visual único para todos os menus/popovers da plataforma.
 * Combina com as classes de posição (absolute, left/right, mt, w-*) no local de
 * uso. z-30 garante que ficam acima da navbar fixa (z-10).
 */
export const dropdownPanel =
  "z-30 overflow-hidden rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-black shadow-lg";
