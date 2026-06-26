"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyProfessorButtons({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function setStatus(status: "APPROVED" | "REJECTED", rejectionReason?: string) {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    });
    setLoading(false);
    setRejecting(false);
    router.refresh();
  }

  if (rejecting) {
    return (
      <div className="flex flex-col gap-2 w-56">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo da rejeição (opcional)"
          rows={2}
          className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1.5 text-sm bg-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setStatus("REJECTED", reason || undefined)}
            disabled={loading}
            className="rounded-md bg-rose-500 text-white px-3 py-1.5 text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            Confirmar rejeição
          </button>
          <button
            onClick={() => setRejecting(false)}
            disabled={loading}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setStatus("APPROVED")}
        disabled={loading}
        className="rounded-md border border-emerald-500 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-sm disabled:opacity-50"
      >
        Aprovar
      </button>
      <button
        onClick={() => setRejecting(true)}
        disabled={loading}
        className="rounded-md border border-rose-500 text-rose-600 dark:text-rose-400 px-3 py-1 text-sm disabled:opacity-50"
      >
        Rejeitar
      </button>
    </div>
  );
}
