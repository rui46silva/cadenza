import type { Metadata } from "next";
import { Crown, Check } from "lucide-react";
import { PREMIUM_PERKS, PREMIUM_PRICE_EUR } from "@/lib/monetization";

export const metadata: Metadata = {
  title: "Cadenza Premium",
  description:
    "Apoia a Cadenza e desbloqueia vantagens: distintivo Premium, perfil em destaque, sem anúncios e mais.",
  alternates: { canonical: "/premium" },
};

export default function PremiumPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-amber-400/15 via-yellow-500/10 to-accent/15 p-6 ring-1 ring-amber-500/30 sm:p-8">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Cadenza Premium
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold">Leva a tua música mais longe</h1>
        <p className="mt-2 text-black/70 dark:text-white/70">
          O Premium ajuda a manter a Cadenza a crescer e dá-te vantagens para te
          destacares na comunidade.
        </p>
        <p className="mt-4 text-2xl font-bold">
          {PREMIUM_PRICE_EUR.toFixed(2).replace(".", ",")} €
          <span className="text-sm font-normal text-black/50 dark:text-white/50"> / mês</span>
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">O que está incluído</h2>
        <ul className="flex flex-col gap-2">
          {PREMIUM_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Check className="h-3 w-3" />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-black/10 dark:border-white/10 p-5 text-center">
        <p className="text-sm text-black/60 dark:text-white/60">
          O pagamento online está quase a chegar. Queres ser dos primeiros a ter
          Premium?
        </p>
        <a
          href="mailto:geral@cadenza.pt?subject=Quero%20Cadenza%20Premium"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          <Crown className="h-4 w-4" />
          Quero ser Premium
        </a>
      </section>
    </div>
  );
}
