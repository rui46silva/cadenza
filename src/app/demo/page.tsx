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
} from "lucide-react";
import Logo from "@/components/Logo";
import { buttonPrimary } from "@/lib/ui";

const FEATURES = [
  { icon: MessagesSquare, label: "Fórum com posts, comentários e melhores respostas" },
  { icon: Flame, label: "Streaks, pontos e badges para manter os músicos a voltar" },
  { icon: Sparkles, label: "Feed personalizado \"Para ti\" com base nos tópicos seguidos" },
  { icon: Trophy, label: "Perfis com conquistas, nível e histórico de atividade" },
  { icon: Newspaper, label: "Notícias e vagas em orquestras, bandas e outros projetos" },
];

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnterDemo() {
    setError(null);
    setLoading(true);
    try {
      await fetch("/api/demo-login", { method: "POST" });
      const res = await signIn("credentials", {
        email: "demo@cadenza.app",
        password: "demo1234",
        redirect: false,
      });
      if (res?.error) {
        setError("Não foi possível entrar em modo demo. Tenta novamente.");
        setLoading(false);
        return;
      }
      router.push("/forum");
      router.refresh();
    } catch {
      setError("Não foi possível entrar em modo demo. Tenta novamente.");
      setLoading(false);
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
          Entra numa conta de demonstração já cheia de atividade — posts, comentários,
          pontuações e tudo — sem precisares de criar conta nem inserir dados reais.
        </p>
      </div>

      <button
        type="button"
        onClick={handleEnterDemo}
        disabled={loading}
        className={`${buttonPrimary} disabled:opacity-50`}
      >
        {loading ? "A preparar a demo..." : "Entrar em modo demo"}
      </button>
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
