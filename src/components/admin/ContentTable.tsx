"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

export type ContentRow = { id: string; href: string; cells: React.ReactNode[] };
export type BulkAction = { action: string; label: string; danger?: boolean };

/**
 * Tabela de conteúdo com seleção múltipla e ações em massa (estilo WordPress).
 * As células já vêm renderizadas do servidor; aqui só tratamos da seleção.
 */
export default function ContentTable({
  columns,
  rows,
  bulkActions,
  bulkEndpoint,
  emptyText = "Sem resultados.",
}: {
  columns: string[];
  rows: ContentRow[];
  bulkActions: BulkAction[];
  bulkEndpoint: string;
  emptyText?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const chosen = bulkActions.find((a) => a.action === action);

  async function run() {
    if (!chosen || selected.size === 0) return;
    setBusy(true);
    const res = await fetch(bulkEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    setConfirm(false);
    if (!res.ok) {
      toast(data?.error ?? "Não foi possível aplicar a ação.", "error");
      return;
    }
    toast(`${chosen.label}: ${data?.count ?? selected.size} item(s)`);
    setSelected(new Set());
    setAction("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-md border border-black/15 bg-transparent px-2 py-1.5 dark:border-white/20"
        >
          <option value="">Ações em massa</option>
          {bulkActions.map((a) => (
            <option key={a.action} value={a.action}>{a.label}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={!chosen || selected.size === 0 || busy}
          onClick={() => (chosen?.danger ? setConfirm(true) : run())}
          className="rounded-md border border-black/15 px-3 py-1.5 hover:border-accent hover:text-accent disabled:opacity-40 dark:border-white/20"
        >
          Aplicar
        </button>
        {selected.size > 0 && (
          <span className="text-xs text-black/50 dark:text-white/50">{selected.size} selecionado(s)</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-black/50 dark:bg-white/5 dark:text-white/50">
            <tr>
              <th className="w-8 px-3 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selecionar tudo" />
              </th>
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {rows.map((r) => (
              <tr key={r.id} className={selected.has(r.id) ? "bg-accent/5" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"}>
                <td className="px-3 py-2.5 align-top">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label="Selecionar" />
                </td>
                {r.cells.map((cell, i) => (
                  <td key={i} className="px-3 py-2.5 align-top">
                    {i === 0 ? <Link href={r.href} className="font-medium hover:text-accent">{cell}</Link> : cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-black/50 dark:text-white/50">{emptyText}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirm && chosen && (
        <ConfirmDialog
          title={`${chosen.label} ${selected.size} item(s)?`}
          description="Esta ação não pode ser desfeita."
          confirmLabel={chosen.label}
          loading={busy}
          onConfirm={run}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}
