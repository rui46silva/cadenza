"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

const inputClass =
  "rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

export default function ChangePasswordForm() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const newPassword = data.get("newPassword") as string;
    const confirm = data.get("confirm") as string;
    if (newPassword !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/users/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.get("currentPassword"),
        newPassword,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "Não foi possível alterar a palavra-passe.");
      return;
    }
    form.reset();
    toast("Palavra-passe alterada");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm flex flex-col gap-1">
        Palavra-passe atual
        <input name="currentPassword" type="password" required className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm flex flex-col gap-1">
          Nova palavra-passe
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            className={inputClass}
          />
        </label>
        <label className="text-sm flex flex-col gap-1">
          Confirmar
          <input name="confirm" type="password" required minLength={8} className={inputClass} />
        </label>
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "A guardar..." : "Alterar palavra-passe"}
      </button>
    </form>
  );
}
