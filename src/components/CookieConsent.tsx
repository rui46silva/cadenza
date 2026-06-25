"use client";

import { useConsent } from "@/components/ConsentProvider";
import { updateConsent } from "@/lib/gtag";

export default function CookieConsent() {
  const { consent, setConsent } = useConsent();

  if (consent !== null) return null;

  function handleDecision(granted: boolean) {
    updateConsent(granted);
    setConsent(granted ? "granted" : "denied");
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 text-sm">
        <p className="flex-1 text-black/70 dark:text-white/70">
          Usamos cookies para análise de tráfego e, quando ativa, para
          publicidade que ajuda a manter a Cadenza gratuita. Podes aceitar ou
          recusar — o site funciona na mesma.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleDecision(false)}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 transition-colors hover:border-accent hover:text-accent"
          >
            Recusar
          </button>
          <button
            onClick={() => handleDecision(true)}
            className="rounded-md bg-accent text-accent-foreground px-3 py-1.5 shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
