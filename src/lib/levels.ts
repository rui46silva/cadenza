import { levelForPoints } from "@/lib/points";

/**
 * Títulos por nível — dão estatuto visível à progressão. O nível vem de
 * levelForPoints(); aqui mapeamos faixas de nível a um título e a uma vantagem
 * cosmética desbloqueada.
 */
const TITLES: { minLevel: number; title: string; perk: string }[] = [
  { minLevel: 1, title: "Aprendiz", perk: "Bem-vindo à Cadenza" },
  { minLevel: 3, title: "Estudante dedicado", perk: "Distintivo de nível no perfil" },
  { minLevel: 5, title: "Músico da casa", perk: "Nome destacado nos comentários" },
  { minLevel: 8, title: "Veterano", perk: "Selo de veterano no perfil" },
  { minLevel: 12, title: "Mestre", perk: "Destaque de mestre na comunidade" },
  { minLevel: 18, title: "Lenda", perk: "Estatuto de lenda da Cadenza" },
];

export function levelInfo(points: number) {
  const base = levelForPoints(points);
  const tier = [...TITLES].reverse().find((t) => base.level >= t.minLevel) ?? TITLES[0];
  const next = TITLES.find((t) => t.minLevel > base.level) ?? null;
  return {
    ...base,
    title: tier.title,
    perk: tier.perk,
    nextTitle: next?.title ?? null,
    nextTitleLevel: next?.minLevel ?? null,
  };
}
