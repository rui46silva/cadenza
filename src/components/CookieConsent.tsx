"use client";

import { useConsent } from "@/components/ConsentProvider";
import { updateConsent, type ConsentDecision } from "@/lib/gtag";

const CATEGORIES = [
  {
    title: "Essenciais",
    description:
      "Necessários para o funcionamento do site — sessão de login, segurança e preferências básicas. Não podem ser desativados.",
  },
  {
    title: "Análise",
    description:
      "Ajudam-nos a perceber como a Cadenza é usada (páginas visitadas, erros) para melhorar a plataforma. Não identificam ninguém individualmente.",
  },
  {
    title: "Publicidade",
    description:
      "Usados para mostrar anúncios relevantes e medir o seu desempenho. Ajudam a manter a Cadenza gratuita.",
  },
];

export default function CookieConsent() {
  const { consent, setConsent, promptOpen, closePrompt } = useConsent();

  const isFirstVisit = consent === null;
  if (!isFirstVisit && !promptOpen) return null;

  function handleDecision(decision: ConsentDecision) {
    updateConsent(decision);
    setConsent(decision);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-4xl px-4 py-4 text-sm">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold">Preferências de cookies</h2>
          {!isFirstVisit && (
            <button
              type="button"
              onClick={closePrompt}
              aria-label="Fechar"
              className="text-black/40 dark:text-white/40 hover:text-accent"
            >
              ✕
            </button>
          )}
        </div>

        <p className="mt-2 text-black/70 dark:text-white/70">
          Usamos cookies para o site funcionar, para perceber como é usado e,
          quando ativa, para publicidade que ajuda a manter a Cadenza
          gratuita. Escolhe as tuas preferências abaixo — o site funciona na
          mesma seja qual for a tua escolha.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="rounded-md border border-black/10 dark:border-white/10 p-2.5"
            >
              <p className="font-medium text-xs">{cat.title}</p>
              <p className="mt-1 text-xs text-black/60 dark:text-white/60">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={() => handleDecision("none")}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 transition-colors hover:border-accent hover:text-accent"
          >
            Rejeitar todas
          </button>
          <button
            onClick={() => handleDecision("essential")}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 transition-colors hover:border-accent hover:text-accent"
          >
            Rejeitar cookies opcionais
          </button>
          <button
            onClick={() => handleDecision("all")}
            className="rounded-md bg-accent text-accent-foreground px-3 py-1.5 shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            Aceitar todas
          </button>
        </div>
      </div>
    </div>
  );
}
