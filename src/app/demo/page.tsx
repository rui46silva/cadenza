"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MessagesSquare,
  Trophy,
  Flame,
  Newspaper,
  Sparkles,
  GraduationCap,
  Music2,
  Star,
} from "lucide-react";
import Logo from "@/components/Logo";

const FEATURES = [
  { icon: MessagesSquare, label: "Fórum com posts, comentários e melhores respostas" },
  { icon: Flame, label: "Streaks, pontos e badges para manter os músicos a voltar" },
  { icon: Sparkles, label: "Feed personalizado \"Para ti\" com base nos tópicos seguidos" },
  { icon: Trophy, label: "Perfis com conquistas, nível e histórico de atividade" },
  { icon: Newspaper, label: "Notícias e vagas em orquestras, bandas e outros projetos" },
];

const PERSONAS = [
  {
    id: "aluno",
    icon: GraduationCap,
    label: "Como aluno",
    description: "João, aluno de saxofone. Vê como é participar, pedir ajuda e evoluir.",
    email: "aluno@cadenza.app",
  },
  {
    id: "professor",
    icon: Music2,
    label: "Como professor",
    description: "Maria, professora de piano verificada. Vê a perspetiva de quem ensina.",
    email: "professor@cadenza.app",
  },
  {
    id: "embaixador",
    icon: Star,
    label: "Como embaixador",
    description: "Mariana, violinista profissional e embaixadora. Vê o badge especial em ação.",
    email: "mariana@cadenza.app",
  },
] as const;

const DEMO_PASSWORD = "password123";

export default function DemoPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEnterDemo(personaId: string, email: string) {
    setError(null);
    setLoadingId(personaId);
    try {
      const seedRes = await fetch("/api/demo-login", { method: "POST" });
      if (!seedRes.ok) {
        setError("Não foi possível preparar a conta demo. Tenta novamente.");
        setLoadingId(null);
        return;
      }
      const res = await signIn("credentials", {
        email,
        password: DEMO_PASSWORD,
        redirect: false,
      });
      if (res?.error) {
        setError("Não foi possível entrar em modo demo. Tenta novamente.");
        setLoadingId(null);
        return;
      }
      router.push("/forum");
      router.refresh();
    } catch {
      setError("Não foi possível entrar em modo demo. Tenta novamente.");
      setLoadingId(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <span className="flex items-center text-black dark:text-white">
        <Logo className="h-10 w-auto" />
      </span>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">
          Experimenta a <span className="text-accent">Cadenza</span> em ação
        </h1>
        <p className="max-w-md text-black/60 dark:text-white/60">
          Escolhe uma perspetiva e entra numa conta de demonstração já cheia de atividade —
          posts, comentários, pontuações e tudo — sem precisares de criar conta.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            type="button"
            onClick={() => handleEnterDemo(persona.id, persona.email)}
            disabled={loadingId !== null}
            className="flex flex-col items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 p-5 text-center transition-colors hover:border-accent hover:bg-accent/5 disabled:opacity-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <persona.icon className="h-5 w-5" />
            </span>
            <span className="font-semibold">
              {loadingId === persona.id ? "A preparar..." : persona.label}
            </span>
            <span className="text-xs text-black/50 dark:text-white/50">
              {persona.description}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="flex flex-col gap-3 text-left sm:grid sm:grid-cols-2 sm:gap-3">
        {FEATURES.map((f) => (
          <li
            key={f.label}
            className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 px-4 py-2 text-sm"
          >
            <f.icon className="h-4 w-4 text-accent shrink-0" />
            {f.label}
          </li>
        ))}
      </ul>

      <p className="text-xs text-black/40 dark:text-white/40">
        © {new Date().getFullYear()} Cadenza. Todos os direitos reservados.
      </p>
    </main>
  );
}
