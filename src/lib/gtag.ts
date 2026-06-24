// Utilitários para o Google Analytics 4 (gtag.js).
// O gtag é carregado globalmente no layout; estes helpers registam eventos.

export const GA_ID = "G-CT664N9STS";

type GtagParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Regista uma visualização de página (útil em navegação SPA do App Router). */
export function pageview(url: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: url });
}

/** Regista um evento personalizado (ex: criação de post, voto, registo). */
export function event(action: string, params: GtagParams = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params);
}
