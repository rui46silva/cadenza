"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";

type Entry = { id: string; email: string; instrument: string | null; date: string };

export default function WaitlistList({ entries }: { entries: Entry[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(entries);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirmId) return;
    const id = confirmId;
    setLoading(true);

    const res = await fetch(`/api/admin/waitlist/${id}`, { method: "DELETE" });
    setLoading(false);
    setConfirmId(null);

    if (!res.ok) {
      toast("Não foi possível eliminar a inscrição.", "error");
      return;
    }
    // Remoção imediata da lista, sem esperar por refresh.
    setItems((prev) => prev.filter((e) => e.id !== id));
    toast("Inscrição eliminada");
  }

  return (
    <section>
      <h2 className="font-semibold mb-3">Lista de espera ({items.length})</h2>
      <ul className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="text-black/50 dark:text-white/50">Ainda não há inscritos.</p>
        )}
        {items.map((w) => (
          <li
            key={w.id}
            className="rounded-lg border border-black/10 dark:border-white/10 p-3 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <p className="font-medium text-sm">{w.email}</p>
              <p className="text-xs text-black/50 dark:text-white/50">
                {w.instrument ?? "Sem instrumento"} · {w.date}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmId(w.id)}
              className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-rose-500 hover:text-rose-500"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      {confirmId && (
        <ConfirmDialog
          title="Eliminar inscrição"
          description="Remove esta entrada da lista de espera."
          confirmLabel="Eliminar"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </section>
  );
}
