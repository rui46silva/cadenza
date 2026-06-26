"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { INFRACTION_LABELS, INFRACTION_ORDER } from "@/lib/moderation";
import type { InfractionType } from "@prisma/client";

export default function ReportPostButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<InfractionType>("SPAM");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, details: details || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setStatus("sent");
      setOpen(false);
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <span className="text-xs text-black/40 dark:text-white/40">Denúncia enviada</span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-black/40 dark:text-white/40 hover:text-rose-500"
        title="Denunciar post"
      >
        <Flag className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-64 rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black p-3 shadow-md flex flex-col gap-2 text-left">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as InfractionType)}
            className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1.5 text-sm bg-transparent"
          >
            {INFRACTION_ORDER.map((r) => (
              <option key={r} value={r}>
                {INFRACTION_LABELS[r]}
              </option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Detalhes (opcional)"
            rows={2}
            className="rounded-md border border-black/15 dark:border-white/20 px-2 py-1.5 text-sm bg-transparent"
          />
          {status === "error" && (
            <p className="text-xs text-rose-500">Já denunciaste este post ou ocorreu um erro.</p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-md bg-rose-500 text-white px-3 py-1.5 text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "A enviar..." : "Denunciar"}
          </button>
        </div>
      )}
    </div>
  );
}
