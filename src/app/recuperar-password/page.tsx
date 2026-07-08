"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonPrimary } from "@/lib/ui";

export default function RecuperarPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const email = new FormData(e.currentTarget).get("email");
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setStatus("done");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Recuperar palavra-passe</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Indica o teu email e enviamos-te um link para definires uma nova palavra-passe.
        </p>
      </div>

      {status === "done" ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
          Se existir uma conta com esse email, vais receber um link para repor a
          palavra-passe. Verifica também a pasta de spam.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="O teu email"
            className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className={`${buttonPrimary} disabled:opacity-50`}
          >
            {status === "loading" ? "A enviar..." : "Enviar link de recuperação"}
          </button>
        </form>
      )}

      <Link href="/login" className="text-sm text-accent hover:underline">
        Voltar ao início de sessão
      </Link>
    </main>
  );
}
