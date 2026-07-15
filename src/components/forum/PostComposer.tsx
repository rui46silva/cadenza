"use client";

import { useState } from "react";
import { FileText, Video, HelpCircle, Music, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import NewPostForm from "@/components/NewPostForm";

type Mode = { video?: boolean; question?: boolean; feedback?: boolean };

const QUICK: { label: string; icon: typeof FileText; color: string; mode: Mode }[] = [
  { label: "Post", icon: FileText, color: "text-accent", mode: {} },
  { label: "Vídeo", icon: Video, color: "text-rose-500", mode: { video: true } },
  { label: "Dúvida", icon: HelpCircle, color: "text-sky-500", mode: { question: true } },
  { label: "Feedback", icon: Music, color: "text-fuchsia-500", mode: { feedback: true } },
];

/**
 * Caixa de criação de post no topo do fórum, ao estilo do Facebook. Ao clicar
 * no campo (ou num atalho), o editor abre-se ali mesmo (inline) — o título e o
 * resto dos campos aparecem por baixo dos botões, sem sair da página. Por
 * defeito o tipo é "post".
 */
export default function PostComposer({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const firstName = name.split(" ")[0];
  const [mode, setMode] = useState<Mode | null>(null);

  if (mode) {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={name} avatarUrl={avatarUrl} size={40} />
            <span className="text-sm font-medium">{firstName}</span>
          </div>
          <button
            type="button"
            onClick={() => setMode(null)}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NewPostForm
          initialVideo={mode.video}
          initialQuestion={mode.question}
          initialFeedback={mode.feedback}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} avatarUrl={avatarUrl} size={40} />
        <button
          type="button"
          onClick={() => setMode({})}
          className="flex-1 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 px-4 py-2.5 text-left text-sm text-black/50 dark:text-white/50 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          O que queres partilhar, {firstName}?
        </button>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1 border-t border-black/10 dark:border-white/10 pt-2">
        {QUICK.map(({ label, icon: Icon, color, mode: m }) => (
          <button
            key={label}
            type="button"
            onClick={() => setMode(m)}
            className="flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-black/60 dark:text-white/60 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon className={`h-4.5 w-4.5 ${color}`} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
