// Utilitários para o Google Analytics 4 (gtag.js).
// O gtag é carregado globalmente no layout; estes helpers registam eventos.

export const GA_ID = "G-WGLH7JC07F";

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

export type ConsentDecision = "all" | "essential" | "none";

/**
 * Atualiza os sinais do Google Consent Mode v2 depois da decisão do
 * utilizador no banner de cookies (ver gtag('consent', 'default', ...)
 * no <head>, que arranca tudo como "denied").
 *
 * "all" concede publicidade e análise, "essential" recusa publicidade mas
 * mantém a análise (ajuda a melhorar a plataforma sem identificar ninguém),
 * "none" recusa tudo.
 */
export function updateConsent(decision: ConsentDecision) {
  if (typeof window === "undefined" || !window.gtag) return;
  const adStatus = decision === "all" ? "granted" : "denied";
  const analyticsStatus = decision === "none" ? "denied" : "granted";
  window.gtag("consent", "update", {
    ad_storage: adStatus,
    ad_user_data: adStatus,
    ad_personalization: adStatus,
    analytics_storage: analyticsStatus,
  });
}
