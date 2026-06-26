export const SORT_OPTIONS = ["recentes", "votados", "comentados"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  recentes: "Mais recentes",
  votados: "Mais votados",
  comentados: "Mais comentados",
};
