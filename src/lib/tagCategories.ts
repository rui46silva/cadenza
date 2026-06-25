import type { TagCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<TagCategory, string> = {
  INSTRUMENT: "Instrumentos",
  GENRE: "Géneros",
  LEVEL: "Nível",
  OTHER: "Outras",
};

export const CATEGORY_ORDER: TagCategory[] = [
  "INSTRUMENT",
  "GENRE",
  "LEVEL",
  "OTHER",
];

export const CATEGORY_DESCRIPTIONS: Record<TagCategory, string> = {
  INSTRUMENT: "Temas sobre instrumentos específicos, como piano, violino ou guitarra.",
  GENRE: "Temas sobre géneros musicais, como jazz, clássica ou pop.",
  LEVEL: "Temas sobre o nível de experiência, do iniciante ao avançado.",
  OTHER: "Outros temas que não se encaixam nas categorias anteriores.",
};

export function isTagCategory(value: string): value is TagCategory {
  return (CATEGORY_ORDER as string[]).includes(value);
}

export function groupTagsByCategory<T extends { category: TagCategory }>(
  tags: T[]
): { category: TagCategory; label: string; tags: T[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    tags: tags.filter((tag) => tag.category === category),
  })).filter((group) => group.tags.length > 0);
}
