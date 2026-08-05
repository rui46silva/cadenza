"use client";

import { useEffect, useRef } from "react";

// Renderiza o widget Cloudflare Turnstile e devolve o token via onToken.
// Se `NEXT_PUBLIC_TURNSTILE_SITE_KEY` não estiver definida, não mostra nada
// (CAPTCHA desligado) — os formulários continuam a funcionar normalmente.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void }
      ) => string;
    };
  }
}

export default function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let cancelled = false;

    function render() {
      if (cancelled || !window.turnstile || !ref.current) return;
      window.turnstile.render(ref.current, {
        sitekey: SITE_KEY!,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
      });
    }

    if (window.turnstile) {
      render();
    } else if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      // Script já a carregar noutro widget — tenta quando estiver pronto.
      const t = setInterval(() => {
        if (window.turnstile) {
          clearInterval(t);
          render();
        }
      }, 200);
      return () => clearInterval(t);
    }

    return () => {
      cancelled = true;
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="my-1" />;
}
