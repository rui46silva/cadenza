"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    min: Math.floor((diff % 3600000) / 60000),
    seg: Math.floor((diff % 60000) / 1000),
  };
}

export default function Countdown({ launchDate }: { launchDate: string }) {
  const target = new Date(launchDate).getTime();
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  const isExpired =
    timeLeft.dias === 0 && timeLeft.horas === 0 && timeLeft.min === 0 && timeLeft.seg === 0;

  if (Number.isNaN(target) || isExpired) return null;

  const units: { label: string; value: number }[] = [
    { label: "dias", value: timeLeft.dias },
    { label: "horas", value: timeLeft.horas },
    { label: "min", value: timeLeft.min },
    { label: "seg", value: timeLeft.seg },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center gap-1 rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 min-w-14"
        >
          <span className="text-xl font-bold tabular-nums text-accent">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
