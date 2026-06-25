import { Music2, MessagesSquare, GraduationCap, Trophy } from "lucide-react";

export const metadata = {
  title: "Brevemente",
};

const FEATURES = [
  { icon: MessagesSquare, label: "Fórum para partilhar e dar feedback" },
  { icon: GraduationCap, label: "Aulas e módulos de e-learning" },
  { icon: Trophy, label: "Conquistas e gamification" },
];

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <span className="flex items-center gap-2 text-2xl font-bold">
        <Music2 className="h-7 w-7 text-accent" />
        Cadenza
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Estamos a afinar os últimos detalhes.</h1>
        <p className="max-w-md text-black/60 dark:text-white/60">
          A comunidade de músicos Cadenza está quase pronta. Volta brevemente
          para partilhares o teu trabalho e aprenderes com outros músicos.
        </p>
      </div>
      <ul className="flex flex-col gap-3 sm:flex-row sm:gap-6">
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
