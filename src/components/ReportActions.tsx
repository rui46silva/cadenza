"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<"DELETE_POST" | "BAN_AUTHOR" | null>(null);
  const [message, setMessage] = useState("");
  const [permanent, setPermanent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function resolve(action: "DELETE_POST" | "BAN_AUTHOR" | "DISMISS") {
    setLoading(true);
    await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, message: message || undefined, permanent }),
    });
    setLoading(false);
    setOpen(null);
    router.refresh();
  }

  if (open) {
    return (
      <div className="flex flex-col gap-2 w-full sm:w-72">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem para o autor (enviada por email)"
          rows={3}
          className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1.5 text-sm bg-transparent"
        />
        {open === "BAN_AUTHOR" && (
          <label className="flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={permanent}
              onChange={(e) => setPermanent(e.target.checked)}
            />
            Banimento permanente
          </label>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => resolve(open)}
            disabled={loading}
            className="rounded-md bg-rose-500 text-white px-3 py-1.5 text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "A processar..." : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setOpen("DELETE_POST")}
        className="rounded-full border border-rose-500 text-rose-500 px-3 py-1 text-xs hover:bg-rose-500/10"
      >
        Apagar post
      </button>
      <button
        type="button"
        onClick={() => setOpen("BAN_AUTHOR")}
        className="rounded-full border border-rose-500 text-rose-500 px-3 py-1 text-xs hover:bg-rose-500/10"
      >
        Banir autor
      </button>
      <button
        type="button"
        onClick={() => resolve("DISMISS")}
        disabled={loading}
        className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent disabled:opacity-50"
      >
        Dispensar
      </button>
    </div>
  );
}
