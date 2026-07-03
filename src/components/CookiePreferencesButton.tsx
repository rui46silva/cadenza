"use client";

import { useState, type ReactNode } from "react";
import { useConsent } from "@/components/ConsentProvider";
import { updateConsent } from "@/lib/gtag";

export default function CookiePreferencesButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { consent, setConsent } = useConsent();

  function handleDecision(granted: boolean) {
    updateConsent(granted);
    setConsent(granted ? "granted" : "denied");
    setOpen(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-5 shadow-lg"
          >
            <h2 className="font-semibold mb-2">Preferências de cookies</h2>
            <p className="text-sm text-black/60 dark:text-white/60 mb-3">
              Usamos cookies para análise de tráfego e, quando ativa, para publicidade que
              ajuda a manter a Cadenza gratuita. Podes aceitar ou recusar — o site funciona
              na mesma.
            </p>
            <p className="text-xs text-black/40 dark:text-white/40 mb-4">
              Estado atual:{" "}
              {consent === "granted" ? "aceites" : consent === "denied" ? "recusados" : "por definir"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleDecision(false)}
                className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={() => handleDecision(true)}
                className="rounded-md bg-accent text-accent-foreground px-3 py-1.5 text-sm shadow-sm transition-all hover:shadow-md hover:brightness-110"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
