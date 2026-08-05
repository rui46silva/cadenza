"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

/**
 * Botão de lançamento do acesso antecipado. Limpa o conteúdo de exemplo
 * (preservando lista de espera, admins e conteúdo de admins) para a plataforma
 * arrancar com os utilizadores reais. Remover depois do lançamento.
 */
export default function LaunchButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLaunch = confirm.trim().toUpperCase() === "LANÇAR";

  async function handleLaunch() {
    if (!canLaunch) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setError(data?.error ?? "Não foi possível lançar.");
      return;
    }
    setOpen(false);
    setConfirm("");
    toast(
      `Lançado! ${data.deletedPosts} posts e ${data.deletedUsers} contas de exemplo removidos · ${data.waitlist} na lista de espera.`
    );
    router.refresh();
  }

  return (
    <div className="rounded-xl border-2 border-amber-500/60 bg-amber-500/5 p-5">
      <h2 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
        <Rocket className="h-5 w-5" />
        Lançar acesso antecipado
      </h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-black/60 dark:text-white/60">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        Remove todo o <strong>conteúdo de exemplo</strong> (posts, comentários e
        contas de demonstração) para a plataforma arrancar limpa. Preserva a lista
        de espera, as contas de administrador e o conteúdo criado por admins. Esta
        ação não pode ser desfeita — faz um backup da base de dados antes.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-amber-500 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500 hover:text-white dark:text-amber-400"
        >
          Lançar acesso antecipado
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <label className="text-sm text-black/70 dark:text-white/70">
            Escreve <strong>LANÇAR</strong> para confirmar:
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="LANÇAR"
              className="mt-1 w-full rounded-md border border-amber-500/50 bg-transparent px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
              autoFocus
            />
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunch}
              disabled={!canLaunch || loading}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-40"
            >
              {loading ? "A lançar..." : "Confirmar lançamento"}
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
