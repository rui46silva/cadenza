"use client";

import { useConsent } from "@/components/ConsentProvider";

export default function CookieConsent() {
  const { consent, setConsent } = useConsent();

  // Só mostra o banner se houver publicidade ou analytics configurados e ainda não houver decisão.
  const trackingConfigured = Boolean(
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || process.env.NEXT_PUBLIC_GA_ID
  );
  if (!trackingConfigured || consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black">
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 text-sm">
        <p className="flex-1 text-black/70 dark:text-white/70">
          Usamos cookies para análise de tráfego e publicidade, que ajudam a
          manter a Cadenza gratuita. Podes aceitar ou recusar — o site funciona
          na mesma.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setConsent("denied")}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5"
          >
            Recusar
          </button>
          <button
            onClick={() => setConsent("granted")}
            className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
