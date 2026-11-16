"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Send, Save, ExternalLink, RotateCcw, Trash2 } from "lucide-react";
import { isFutureDate } from "@/lib/datetime";

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-black/10 dark:border-white/10">
      <h3 className="border-b border-black/10 px-4 py-2.5 text-sm font-semibold dark:border-white/10">{title}</h3>
      <div className="flex flex-col gap-3 p-4">{children}</div>
    </section>
  );
}

export type PublishState = "draft" | "published";

/**
 * Caixa "Publicação" (estilo WordPress): estado, data de publicação/agendamento,
 * botões para guardar rascunho e publicar, e ligação para ver a página.
 */
export function PublishPanel({
  supportsDraft = true,
  supportsSchedule = false,
  state,
  onStateChange,
  publishAt,
  onPublishAtChange,
  onSave,
  onDelete,
  saving,
  dirty,
  savedAt,
  isNew,
  viewHref,
  extra,
}: {
  supportsDraft?: boolean;
  supportsSchedule?: boolean;
  state: PublishState;
  onStateChange?: (s: PublishState) => void;
  publishAt?: string;
  onPublishAtChange?: (v: string) => void;
  onSave: (publish: boolean) => void;
  onDelete?: () => void;
  saving: boolean;
  dirty: boolean;
  savedAt: Date | null;
  isNew: boolean;
  viewHref?: string | null;
  extra?: React.ReactNode;
}) {
  // A data escolhida está no futuro → o botão principal agenda.
  const scheduledInput = Boolean(supportsSchedule && isFutureDate(publishAt));
  const scheduled = state === "published" && scheduledInput;
  const statusLabel = !supportsDraft ? "Publicada" : state === "draft" ? "Rascunho" : scheduled ? "Agendada" : "Publicada";
  const statusColor = state === "draft" ? "bg-black/40" : scheduled ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Panel title="Publicação">
      <div className="flex items-center justify-between text-sm">
        <span className="text-black/50 dark:text-white/50">Estado</span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className={`h-2 w-2 rounded-full ${statusColor}`} />
          {statusLabel}
        </span>
      </div>

      {supportsDraft && onStateChange && (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/5 p-1 text-xs dark:bg-white/10">
          {(["draft", "published"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStateChange(s)}
              className={`rounded-md px-2 py-1.5 ${state === s ? "bg-white font-medium shadow-sm dark:bg-neutral-800" : "text-black/60 dark:text-white/60"}`}
            >
              {s === "draft" ? "Rascunho" : "Publicada"}
            </button>
          ))}
        </div>
      )}

      {supportsSchedule && onPublishAtChange && (
        <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">
          Data de publicação {scheduled && <span className="text-amber-600 dark:text-amber-400">(fica visível nessa data)</span>}
          <input
            type="datetime-local"
            value={publishAt ?? ""}
            onChange={(e) => onPublishAtChange(e.target.value)}
            className="rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm text-black dark:border-white/20 dark:text-white"
          />
        </label>
      )}

      {extra}

      <div className="flex flex-col gap-2 pt-1">
        {supportsDraft && (
          <button
            type="button"
            onClick={() => onSave(false)}
            disabled={saving}
            className="flex items-center justify-center gap-1.5 rounded-md border border-black/15 px-3 py-2 text-sm hover:border-accent hover:text-accent disabled:opacity-50 dark:border-white/20"
          >
            <Save className="h-4 w-4" /> {state === "published" && !isNew ? "Passar a rascunho" : "Guardar rascunho"}
          </button>
        )}
        <button
          type="button"
          onClick={() => onSave(true)}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:brightness-110 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {saving ? "A guardar…" : scheduledInput ? "Agendar" : isNew || (supportsDraft && state === "draft") ? "Publicar" : "Atualizar"}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-black/40 dark:text-white/40">
        <span>
          {dirty ? "Alterações por guardar" : savedAt ? `Guardado ${savedAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
        {viewHref && (
          <Link href={viewHref} target="_blank" className="flex items-center gap-1 text-accent hover:underline">
            Ver <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      {onDelete && !isNew && (
        <button type="button" onClick={onDelete} className="flex items-center gap-1 self-start text-xs text-rose-500 hover:underline">
          <Trash2 className="h-3.5 w-3.5" /> Mover para o lixo (eliminar)
        </button>
      )}
    </Panel>
  );
}

type Revision = { id: string; createdAt: string; authorName: string | null; data: Record<string, unknown> };

/** Caixa "Revisões": lista as versões guardadas e permite restaurar uma. */
export function RevisionsPanel({
  entityType,
  entityId,
  refreshKey,
  onRestore,
}: {
  entityType: "news" | "job" | "page";
  entityId: string;
  refreshKey: number;
  onRestore: (data: Record<string, unknown>) => void;
}) {
  const [items, setItems] = useState<Revision[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/revisions?entityType=${entityType}&entityId=${entityId}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []));
  }, [entityType, entityId, refreshKey]);

  return (
    <Panel title="Revisões">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-sm text-black/70 hover:text-accent dark:text-white/70">
        <History className="h-4 w-4" /> {items.length} versão(ões) guardada(s)
      </button>
      {open && (
        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {items.map((r, i) => (
            <li key={r.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/10">
              <span>
                {new Date(r.createdAt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                <span className="text-black/40 dark:text-white/40"> · {r.authorName ?? "?"}{i === 0 ? " · atual" : ""}</span>
              </span>
              {i > 0 && (
                <button type="button" onClick={() => onRestore(r.data)} className="flex items-center gap-1 text-accent hover:underline">
                  <RotateCcw className="h-3 w-3" /> Restaurar
                </button>
              )}
            </li>
          ))}
          {items.length === 0 && <li className="text-xs text-black/40 dark:text-white/40">Sem revisões ainda.</li>}
        </ul>
      )}
    </Panel>
  );
}
