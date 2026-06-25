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

/**
 * Atualiza os sinais do Google Consent Mode v2 depois da decisão do
 * utilizador no banner de cookies (ver gtag('consent', 'default', ...)
 * no <head>, que arranca tudo como "denied").
 */
export function updateConsent(granted: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;
  const status = granted ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: status,
    ad_user_data: status,
    ad_personalization: status,
    analytics_storage: status,
  });
}
