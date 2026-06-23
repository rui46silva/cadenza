"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ALUNO" | "PROFESSOR">("ALUNO");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      instrument: formData.get("instrument") || undefined,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="name"
          placeholder="Nome"
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (mín. 8 caracteres)"
          required
          minLength={8}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "ALUNO" | "PROFESSOR")}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        >
          <option value="ALUNO">Sou aluno</option>
          <option value="PROFESSOR">Sou professor</option>
        </select>
        <input
          name="instrument"
          placeholder="Que instrumento tocas? (ex: piano, saxofone)"
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        {role === "PROFESSOR" && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Contas de professor ficam pendentes de verificação por um admin
            antes de aparecerem como verificadas.
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 disabled:opacity-50"
        >
          {loading ? "A criar..." : "Criar conta"}
        </button>
      </form>
      <p className="text-sm mt-3 text-black/60 dark:text-white/60">
        Já tens conta?{" "}
        <Link href="/login" className="underline">
          Entra
        </Link>
      </p>
    </div>
  );
}
