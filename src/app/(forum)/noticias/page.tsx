import { Newspaper } from "lucide-react";

export default function NoticiasPage() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-black/10 dark:border-white/10 p-10 text-center">
      <Newspaper className="h-8 w-8 text-accent" />
      <h1 className="text-xl font-bold">Notícias</h1>
      <p className="max-w-md text-black/60 dark:text-white/60">
        Em breve vais encontrar aqui notícias do mundo da música, selecionadas
        para a comunidade Cadenza.
      </p>
      <span className="rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-xs text-black/50 dark:text-white/50">
        brevemente
      </span>
    </div>
  );
}
