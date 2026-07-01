"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  requireText,
  danger = true,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Se definido, o botão de confirmação só ativa depois de escrever este texto exatamente. */
  requireText?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const canConfirm = !requireText || typed === requireText;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-5 shadow-lg"
      >
        <div className="flex items-start gap-3">
          {danger && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
          )}
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-black/60 dark:text-white/60">{description}</p>
            )}
          </div>
        </div>

        {requireText && (
          <div className="mt-4">
            <label className="mb-1 block text-xs text-black/50 dark:text-white/50">
              Escreve <span className="font-mono font-semibold">{requireText}</span> para
              confirmar
            </label>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || loading}
            className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
              danger
                ? "bg-rose-500 text-white hover:brightness-110"
                : "bg-accent text-accent-foreground hover:brightness-110"
            }`}
          >
            {loading ? "A processar..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
