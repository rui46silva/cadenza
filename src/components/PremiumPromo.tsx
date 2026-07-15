"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Crown, X, Check } from "lucide-react";
import { PREMIUM_PERKS } from "@/lib/monetization";

// Quanto tempo esperar antes de voltar a mostrar o popup à mesma pessoa.
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 dias
const STORAGE_KEY = "cadenza_premium_promo_ts";
// Fallback: se a pessoa não fizer scroll, mostrar ao fim deste tempo.
const FALLBACK_MS = 45_000;

function cooldownElapsed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    return Date.now() - Number(raw) > COOLDOWN_MS;
  } catch {
    return true;
  }
}

/**
 * Popup discreto que dá a conhecer o Cadenza Premium. Aparece quando a pessoa
 * faz scroll até certa zona do fórum (ou, em alternativa, ao fim de algum tempo),
 * no máximo uma vez a cada poucos dias, para não ser invasivo nem afastar do fórum.
 * O fundo fica com blur para dar ênfase.
 */
export default function PremiumPromo() {
  const [open, setOpen] = useState(false);
  // `visible` controla a animação de entrada/saída (transição suave).
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
    // Espera a transição de saída antes de desmontar.
    setTimeout(() => setOpen(false), 250);
  }, []);

  const trigger = useCallback(() => {
    if (!cooldownElapsed()) return false;
    setOpen(true);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignora indisponibilidade do localStorage */
    }
    return true;
  }, []);

  useEffect(() => {
    if (!cooldownElapsed()) return;

    // Mostra quando a pessoa já mergulhou no fórum (scroll > ~1.5 ecrãs).
    let done = false;
    const onScroll = () => {
      if (done) return;
      const threshold = window.innerHeight * 1.5;
      if (window.scrollY > threshold) {
        done = true;
        window.removeEventListener("scroll", onScroll);
        clearTimeout(timer);
        trigger();
      }
    };

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      window.removeEventListener("scroll", onScroll);
      trigger();
    }, FALLBACK_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [trigger]);

  // Ativa a animação de entrada no frame seguinte a abrir.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Fecha com a tecla Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Conhece o Cadenza Premium"
    >
      {/* Fundo com blur para dar ênfase ao popup — surge suavemente. */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={close}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/30 bg-white shadow-2xl transition-all duration-300 ease-out dark:bg-neutral-900 ${
          visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
        } motion-reduce:transform-none motion-reduce:transition-opacity`}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute right-3 top-3 rounded-full p-1.5 text-black/40 transition-colors hover:bg-black/5 dark:text-white/40 dark:hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-amber-400/15 via-yellow-500/10 to-accent/15 p-6">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Cadenza Premium
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold">Destaca-te na comunidade</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Apoia a Cadenza e desbloqueia vantagens exclusivas.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-6">
          <ul className="flex flex-col gap-2">
            {PREMIUM_PERKS.slice(0, 3).map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Check className="h-3 w-3" />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <Link
            href="/premium"
            onClick={close}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:shadow-md"
          >
            <Crown className="h-4 w-4" />
            Conhecer o Premium
          </Link>
          <button
            type="button"
            onClick={close}
            className="text-center text-sm text-black/50 hover:text-black/70 dark:text-white/50 dark:hover:text-white/70"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
