"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import InstrumentInput from "@/components/InstrumentInput";

type Tag = { id: string; name: string };

const TOTAL_STEPS = 3;

async function complete() {
  await fetch("/api/onboarding/complete", { method: "POST" }).catch(() => null);
}

export default function OnboardingGate({
  initialInstrument,
  tags,
}: {
  initialInstrument: string | null;
  tags: Tag[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dismissed, setDismissed] = useState(false);
  const [instrument, setInstrument] = useState(initialInstrument ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (dismissed) return null;

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function skipAll() {
    setDismissed(true);
    await complete();
    router.refresh();
  }

  async function handleInstrumentContinue() {
    setLoading(true);
    await fetch("/api/onboarding/instrument", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instrument }),
    }).catch(() => null);
    setLoading(false);
    setStep(2);
  }

  async function handleTagsContinue() {
    if (selectedTagIds.length > 0) {
      setLoading(true);
      await fetch("/api/onboarding/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: selectedTagIds }),
      }).catch(() => null);
      setLoading(false);
    }
    setStep(3);
  }

  async function handleFinish() {
    setDismissed(true);
    await complete();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-accent" : "bg-black/10 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skipAll}
            className="text-xs text-black/40 dark:text-white/40 hover:underline"
          >
            Saltar
          </button>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Bem-vindo à Cadenza! 👋</h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              Vamos preparar o teu perfil em 3 passos rápidos. Que instrumento tocas?
            </p>
            <InstrumentInput name="instrument" value={instrument} onChange={setInstrument} />
            <button
              type="button"
              onClick={handleInstrumentContinue}
              disabled={loading}
              className="mt-2 self-end rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Segue pelo menos 3 tópicos</h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              Escolhe os tópicos que mais te interessam para começares a ver conteúdo relevante.
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={
                      active
                        ? "rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium"
                        : "rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent"
                    }
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-black/40 dark:text-white/40">
                {selectedTagIds.length}/3 selecionados
              </span>
              <button
                type="button"
                onClick={handleTagsContinue}
                disabled={loading}
                className="rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50"
              >
                {selectedTagIds.length >= 3 ? "Continuar" : "Saltar este passo"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <PartyPopper className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-bold">Cria o teu primeiro post</h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              Partilha algo que estás a tocar, uma dúvida ou uma conquista. É a melhor forma de
              começares a fazer parte da comunidade.
            </p>
            <Link
              href="/posts/new"
              onClick={handleFinish}
              className="w-full rounded-md bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:brightness-110"
            >
              Criar o meu primeiro post
            </Link>
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs text-black/40 dark:text-white/40 hover:underline"
            >
              Saltar por agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
