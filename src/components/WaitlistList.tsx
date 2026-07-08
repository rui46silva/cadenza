"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";

type Entry = {
  id: string;
  email: string;
  name: string | null;
  instrument: string | null;
  invited: boolean;
  date: string;
};

export default function WaitlistList({ entries }: { entries: Entry[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(entries);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invitingAll, setInvitingAll] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const pending = items.filter((e) => !e.invited).length;

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
    setItems((prev) => prev.filter((e) => e.id !== id));
    toast("Inscrição eliminada");
  }

  async function invite(id?: string) {
    if (id) setInvitingId(id);
    else setInvitingAll(true);
    const res = await fetch("/api/admin/waitlist/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : {}),
    });
    setInvitingId(null);
    setInvitingAll(false);
    if (!res.ok) {
      toast("Não foi possível enviar o convite.", "error");
      return;
    }
    const data = await res.json().catch(() => null);
    setItems((prev) =>
      prev.map((e) => (id ? (e.id === id ? { ...e, invited: true } : e) : { ...e, invited: true }))
    );
    toast(
      id
        ? "Convite enviado"
        : `${data?.invited ?? 0} convite(s) enviado(s)`
    );
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Lista de espera ({items.length})</h2>
        {pending > 0 && (
          <button
            type="button"
            onClick={() => invite()}
            disabled={invitingAll}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:brightness-110 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {invitingAll ? "A enviar..." : `Convidar todos (${pending})`}
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="text-black/50 dark:text-white/50">Ainda não há inscritos.</p>
        )}
        {items.map((w) => (
          <li
            key={w.id}
            className="rounded-lg border border-black/10 dark:border-white/10 p-3 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm">
                {w.name ? `${w.name} · ` : ""}
                <span className="text-black/60 dark:text-white/60">{w.email}</span>
              </p>
              <p className="text-xs text-black/50 dark:text-white/50">
                {w.instrument ?? "Sem instrumento"} · {w.date}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {w.invited ? (
                <span className="flex items-center gap-1 text-xs text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                  Convidado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => invite(w.id)}
                  disabled={invitingId === w.id}
                  className="flex items-center gap-1 rounded-full border border-accent/40 px-3 py-1 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {invitingId === w.id ? "A enviar..." : "Convidar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmId(w.id)}
                className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-rose-500 hover:text-rose-500"
              >
                Eliminar
              </button>
            </div>
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
