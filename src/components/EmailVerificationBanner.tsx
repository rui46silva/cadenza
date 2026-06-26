"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";

export default function EmailVerificationBanner() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar o email.");
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <MailWarning className="h-4 w-4 shrink-0" />
        <span>O teu email ainda não está confirmado.</span>
      </div>
      {status === "sent" ? (
        <p className="text-amber-700 dark:text-amber-400">
          Email enviado! Verifica a tua caixa de entrada.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={status === "loading"}
          className="self-start text-amber-700 dark:text-amber-400 underline disabled:opacity-50"
        >
          {status === "loading" ? "A enviar..." : "Reenviar email de confirmação"}
        </button>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
