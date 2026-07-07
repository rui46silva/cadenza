import { Star } from "lucide-react";
import { levelInfo } from "@/lib/levels";

/**
 * Barra de progresso de nível — mostra o nível atual, o título e quanto falta
 * para o próximo nível, para tornar a progressão visível e motivante.
 */
export default function LevelProgress({ points }: { points: number }) {
  const info = levelInfo(points);
  const pct = Math.round(info.progress * 100);
  const remaining = info.pointsForNextLevel - info.pointsIntoLevel;

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Star className="h-4 w-4" />
          </span>
          Nível {info.level} · {info.title}
        </span>
        <span className="text-xs text-black/50 dark:text-white/50">{points} pontos</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-black/50 dark:text-white/50">
        Faltam <strong className="text-accent">{remaining} pontos</strong> para o nível{" "}
        {info.level + 1}
        {info.nextTitle && info.nextTitleLevel === info.level + 1 && (
          <> — desbloqueias &ldquo;{info.nextTitle}&rdquo;</>
        )}
        .
      </p>
    </div>
  );
}
