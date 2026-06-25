"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INFRACTION_LABELS, INFRACTION_ORDER } from "@/lib/moderation";
import type { InfractionType } from "@prisma/client";

export default function BanControls({
  userId,
  activeBan,
}: {
  userId: string;
  activeBan: { infraction: InfractionType; expiresAt: Date | null } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [infraction, setInfraction] = useState<InfractionType>("SPAM");
  const [reason, setReason] = useState("");
  const [permanent, setPermanent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBan() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ infraction, reason: reason || undefined, permanent }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  async function handleUnban() {
    if (!confirm("Levantar o banimento deste utilizador?")) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/ban`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (activeBan) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full border border-rose-500 text-rose-600 dark:text-rose-400 px-2 py-0.5">
          Banido — {INFRACTION_LABELS[activeBan.infraction]}
          {activeBan.expiresAt
            ? ` até ${new Date(activeBan.expiresAt).toLocaleDateString("pt-PT")}`
            : " (permanente)"}
        </span>
        <button
          onClick={handleUnban}
          disabled={loading}
          className="text-accent hover:underline disabled:opacity-50"
        >
          Levantar banimento
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-rose-500 text-rose-500 px-3 py-1 text-xs hover:bg-rose-500/10"
      >
        Banir
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-64 rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black p-3 shadow-md flex flex-col gap-2">
          <select
            value={infraction}
            onChange={(e) => setInfraction(e.target.value as InfractionType)}
            className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1.5 text-sm bg-transparent"
          >
            {INFRACTION_ORDER.map((i) => (
              <option key={i} value={i}>
                {INFRACTION_LABELS[i]}
              </option>
            ))}
          </select>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo (opcional)"
            rows={2}
            className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1.5 text-sm bg-transparent"
          />
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={permanent}
              onChange={(e) => setPermanent(e.target.checked)}
            />
            Banimento permanente
          </label>
          <button
            type="button"
            onClick={handleBan}
            disabled={loading}
            className="rounded-md bg-rose-500 text-white px-3 py-1.5 text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "A banir..." : "Confirmar banimento"}
          </button>
        </div>
      )}
    </div>
  );
}
