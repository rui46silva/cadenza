/** Utilitários de monetização (Premium e destaque de perfil). */

export function isPremiumActive(user: {
  isPremium?: boolean | null;
  premiumUntil?: Date | string | null;
}): boolean {
  if (!user.isPremium) return false;
  if (!user.premiumUntil) return true; // sem data = vitalício/indefinido
  return new Date(user.premiumUntil).getTime() > Date.now();
}

export function isFeaturedActive(user: {
  featuredUntil?: Date | string | null;
}): boolean {
  if (!user.featuredUntil) return false;
  return new Date(user.featuredUntil).getTime() > Date.now();
}

/** Benefícios do plano Premium, usados na página /premium. */
export const PREMIUM_PERKS: string[] = [
  "Distintivo Premium no teu perfil e nos posts",
  "Perfil em destaque nos diretórios",
  "Navegação sem anúncios",
  "Estatísticas avançadas do teu percurso",
  "Acesso antecipado a novas funcionalidades",
];

export const PREMIUM_PRICE_EUR = 3.99;
