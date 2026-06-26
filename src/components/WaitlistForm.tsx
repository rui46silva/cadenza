"use client";

import { useState } from "react";
import InstrumentInput from "@/components/InstrumentInput";

export default function WaitlistForm({
  initialCount,
  limit,
  initials = [],
}: {
  initialCount: number;
  limit?: number;
  initials?: string[];
}) {
  const [email, setEmail] = useState("");
  const [instrument, setInstrument] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [count, setCount] = useState(initialCount);

  const socialProof =
    count > 0 ? (
      <div className="flex items-center gap-3">
        <div className="flex items-center -space-x-2">
          {initials.map((init, i) => (
            <span
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-black bg-accent/20 text-xs font-semibold text-accent"
            >
              {init}
            </span>
          ))}
          {count > initials.length && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-black bg-black/10 dark:bg-white/10 text-xs font-semibold text-black/60 dark:text-white/60">
              +
            </span>
          )}
        </div>
        <p className="text-sm">
          <span className="font-semibold">{count} músicos</span> já na lista de espera
        </p>
        <span className="flex items-center gap-1 text-xs text-emerald-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />A crescer agora
        </span>
      </div>
    ) : null;

  const progress = limit ? (
    <div className="flex w-full max-w-md flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${Math.min(100, (count / limit) * 100)}%` }}
        />
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        {Math.min(count, limit)}/{limit} lugares de acesso antecipado ocupados
      </p>
    </div>
  ) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || status === "done") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, instrument: instrument || undefined }),
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
      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-accent/30 bg-accent/10 px-6 py-4 text-center">
          <p className="font-medium text-accent">Estás na lista! 🎉</p>
          <p className="text-sm text-black/60 dark:text-white/60">
            Avisamos-te por email assim que o acesso antecipado abrir
            {instrument ? ` e quando houver uma masterclass de ${instrument.toLowerCase()}` : ""}.
          </p>
        </div>
        {socialProof}
        {progress}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
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
        </div>
        <InstrumentInput
          name="instrument"
          value={instrument}
          onChange={setInstrument}
          className="w-full rounded-full border border-black/15 dark:border-white/20 bg-transparent px-4 py-2.5 text-sm"
        />
      </form>
      {status === "error" && (
        <p className="text-xs text-rose-500">Algo correu mal. Tenta de novo.</p>
      )}
      {socialProof}
      {progress}
    </div>
  );
}
