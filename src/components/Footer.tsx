import Link from "next/link";
import { Music2 } from "lucide-react";

const LINKS = [
  { href: "/regras", label: "Regras do fórum" },
  { href: "/privacidade", label: "Política de privacidade" },
  { href: "/acessibilidade", label: "Acessibilidade" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-8">
      <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Music2 className="h-4 w-4 text-accent" />
          Cadenza
        </span>
        <nav className="flex flex-wrap gap-4 text-sm text-black/60 dark:text-white/60">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="text-xs text-black/40 dark:text-white/40">
          © {year} Cadenza. Todos os direitos reservados.
        </span>
      </div>
    </footer>
  );
}
