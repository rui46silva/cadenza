// Utilitários para o Google Analytics 4 (gtag.js).
// O id vem da env var pública; sem ele, nada é carregado nem registado.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type GtagParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Regista uma visualização de página (útil em navegação SPA do App Router). */
export function pageview(url: string) {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: url });
}

/** Regista um evento personalizado (ex: criação de post, voto, registo). */
export function event(action: string, params: GtagParams = {}) {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params);
}
