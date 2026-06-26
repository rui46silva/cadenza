const UNITS: { limit: number; div: number; label: string }[] = [
  { limit: 60, div: 1, label: "agora" },
  { limit: 3600, div: 60, label: "min" },
  { limit: 86400, div: 3600, label: "h" },
  { limit: 2592000, div: 86400, label: "d" },
];

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "agora";

  for (const { limit, div, label } of UNITS.slice(1)) {
    if (seconds < limit) {
      return `há ${Math.floor(seconds / div)}${label}`;
    }
  }

  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}
