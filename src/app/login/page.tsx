"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { event } from "@/lib/gtag";
import { buttonPrimary } from "@/lib/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function attemptSignIn(email: string, password: string) {
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      if (res.code === "banned") {
        setError(
          "A tua conta foi suspensa por violação das regras do fórum. Consulta a página de regras para mais detalhes."
        );
      } else {
        setError("Email ou password incorretos.");
      }
      return false;
    }
    router.push("/forum");
    router.refresh();
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const ok = await attemptSignIn(
      formData.get("email") as string,
      formData.get("password") as string
    );

    setLoading(false);
    if (ok) event("login", { method: "credentials" });
  }

  async function handleDemoLogin() {
    setError(null);
    setDemoLoading(true);
    try {
      const seedRes = await fetch("/api/demo-login", { method: "POST" });
      if (!seedRes.ok) {
        setError("Não foi possível preparar a conta demo. Tenta novamente.");
        return;
      }
      const ok = await attemptSignIn("demo@cadenza.app", "demo1234");
      if (ok) event("login", { method: "demo" });
    } catch {
      setError("Não foi possível preparar a conta demo. Tenta novamente.");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="flex w-full justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-lg rounded-xl border border-black/10 dark:border-white/10 p-8 sm:p-10">
        <h1 className="text-2xl font-bold mb-1">Entrar</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mb-6">
          Entra na tua conta para participar na comunidade.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-md border border-black/15 dark:border-white/20 px-4 py-2.5 bg-transparent"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="rounded-md border border-black/15 dark:border-white/20 px-4 py-2.5 bg-transparent"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`${buttonPrimary} disabled:opacity-50`}
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-black/40 dark:text-white/40">
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          ou
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full rounded-md border border-black/15 dark:border-white/20 px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {demoLoading ? "A entrar..." : "Experimentar em modo demo"}
        </button>
        <p className="mt-1.5 text-xs text-black/40 dark:text-white/40">
          Explora a Cadenza com uma conta de demonstração, sem precisares de te registares.
        </p>

        <p className="text-sm mt-4 text-black/60 dark:text-white/60">
          Ainda não tens conta?{" "}
          <Link href="/register" className="underline">
            Cria uma
          </Link>
        </p>
      </div>
    </div>
  );
}
