"use client";

import { useState } from "react";

export default function WaitlistForm({ initialCount }: { initialCount: number }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [count, setCount] = useState(initialCount);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || status === "done") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCount(data.count);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border border-accent/30 bg-accent/10 px-6 py-4 text-center">
        <p className="font-medium text-accent">Estás na lista! 🎉</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          Avisamos-te por email assim que o acesso antecipado abrir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="O teu email"
          className="w-full rounded-full border border-black/15 dark:border-white/20 bg-transparent px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:brightness-110 disabled:opacity-50"
        >
          {status === "loading" ? "A entrar..." : "Entrar na lista de espera"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-rose-500">Algo correu mal. Tenta de novo.</p>
      )}
      {count > 0 && (
        <p className="text-xs text-black/50 dark:text-white/50">
          Junta-te a {count} músicos já na lista de espera.
        </p>
      )}
    </div>
  );
}
