import Link from "next/link";
import { Music4, Home, Compass } from "lucide-react";
import { buttonPrimary, buttonOutline } from "@/lib/ui";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-fuchsia-500/10 ring-1 ring-accent/20">
          <Music4 className="h-10 w-10 text-accent" />
          <span className="absolute -right-2 -top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground shadow-sm">
            404
          </span>
        </div>

        <h1 className="text-2xl font-bold sm:text-3xl">Esta página saiu do compasso</h1>
        <p className="mt-2 text-black/60 dark:text-white/60">
          Não encontrámos o que procuravas. Pode ter sido movido, removido ou o
          link estar errado. Vamos voltar ao ritmo?
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/forum" className={`${buttonPrimary} inline-flex items-center justify-center gap-2`}>
            <Home className="h-4 w-4" />
            Voltar ao fórum
          </Link>
          <Link href="/explorar" className={`${buttonOutline} inline-flex items-center justify-center gap-2`}>
            <Compass className="h-4 w-4" />
            Explorar a Cadenza
          </Link>
        </div>
      </div>
    </div>
  );
}
