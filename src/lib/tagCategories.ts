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

export function groupTagsByCategory<T extends { category: TagCategory }>(
  tags: T[]
): { category: TagCategory; label: string; tags: T[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    tags: tags.filter((tag) => tag.category === category),
  })).filter((group) => group.tags.length > 0);
}
