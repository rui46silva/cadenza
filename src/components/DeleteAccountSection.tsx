"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle } from "lucide-react";

export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm.trim().toUpperCase() === "APAGAR";

  async function handleDelete() {
    if (!canDelete) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/users/me", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível eliminar a conta.");
      setLoading(false);
      return;
    }
    // Termina a sessão e volta à página inicial.
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="rounded-xl border-2 border-rose-500/60 bg-rose-500/5 p-5">
      <h2 className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-5 w-5" />
        Eliminar conta
      </h2>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        A tua conta fica desativada de imediato. Guardamos os teus dados durante um
        período e podes recuperá-la simplesmente voltando a iniciar sessão. Se não o
        fizeres, a conta será removida definitivamente.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-rose-500 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500 hover:text-white dark:text-rose-400"
        >
          Eliminar a minha conta
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <label className="text-sm text-black/70 dark:text-white/70">
            Escreve <strong>APAGAR</strong> para confirmar:
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="APAGAR"
              className="mt-1 w-full rounded-md border border-rose-500/50 bg-transparent px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500"
              autoFocus
            />
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || loading}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-40"
            >
              {loading ? "A eliminar..." : "Eliminar definitivamente"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirm("");
                setError(null);
              }}
              className="rounded-md border border-black/15 dark:border-white/20 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
