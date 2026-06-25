"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "@/components/ConsentProvider";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Bloco de publicidade AdSense, discreto e claramente marcado.
 * Só renderiza se houver client id + slot configurados e consentimento dado.
 */
export default function AdSlot({ slot }: { slot?: string }) {
  const { consent } = useConsent();
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pushed = useRef(false);

  const enabled = Boolean(client && slot && consent === "granted");

  useEffect(() => {
    if (!enabled || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // ignora — o script pode ainda não ter carregado
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside className="rounded-lg border border-black/10 dark:border-white/10 p-2 text-center">
      <span className="block text-[10px] uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">
        Publicidade
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
