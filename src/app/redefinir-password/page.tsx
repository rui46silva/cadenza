"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonPrimary } from "@/lib/ui";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível repor a palavra-passe.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm">
        Link inválido. Pede uma nova recuperação em{" "}
        <Link href="/recuperar-password" className="text-accent hover:underline">
          recuperar palavra-passe
        </Link>
        .
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
        Palavra-passe atualizada! A redirecionar para o início de sessão...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Nova palavra-passe (mín. 8 caracteres)"
        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
      />
      <input
        name="confirm"
        type="password"
        required
        minLength={8}
        placeholder="Confirmar palavra-passe"
        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2"
      />
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={`${buttonPrimary} disabled:opacity-50`}
      >
        {loading ? "A guardar..." : "Definir nova palavra-passe"}
      </button>
    </form>
  );
}

export default function RedefinirPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Nova palavra-passe</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Escolhe uma nova palavra-passe para a tua conta.
        </p>
      </div>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
