"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function format(target: number) {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Conta o tempo que falta até ao fim do desafio da semana. */
export default function ChallengeCountdown({ endsAt }: { endsAt: string }) {
  const target = new Date(endsAt).getTime();
  const [label, setLabel] = useState(() => format(target));

  useEffect(() => {
    const id = setInterval(() => setLabel(format(target)), 30000);
    return () => clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;

  return (
    <span className="flex items-center gap-1.5 text-sm text-black/50 dark:text-white/50">
      <Clock className="h-4 w-4" />
      Termina em {label}
    </span>
  );
}
