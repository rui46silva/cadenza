import { Star } from "lucide-react";
import { levelForPoints } from "@/lib/points";

export default function LevelBadge({ points }: { points: number }) {
  const { level } = levelForPoints(points);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-accent/40 text-accent px-2 py-0.5 text-xs bg-accent/10"
      title={`${points} pontos`}
    >
      <Star className="h-3.5 w-3.5" />
      Nível {level}
    </span>
  );
}
