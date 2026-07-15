"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";

// Rótulos legíveis para cada segmento conhecido do URL.
const LABELS: Record<string, string> = {
  forum: "Fórum",
  popular: "Popular",
  explorar: "Explorar",
  categorias: "Categorias",
  desafios: "Desafio da semana",
  feedback: "Feedback",
  duvidas: "Dúvidas",
  professores: "Profissionais",
  embaixadores: "Embaixadores",
  noticias: "Notícias",
  vagas: "Vagas e oportunidades",
  posts: "Publicação",
  perfil: "Perfil",
  recursos: "Recursos",
  ranking: "Ranking",
  premium: "Premium",
};

function label(segment: string): string {
  return LABELS[segment] ?? decodeURIComponent(segment);
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Na raiz do fórum não mostramos breadcrumbs (evita ruído).
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "forum")) {
    return null;
  }

  // Constrói o caminho acumulado para cada crumb. O último segmento (muitas
  // vezes um id) não é clicável e mostra um rótulo genérico da secção anterior.
  const crumbs = segments.map((seg, i) => ({
    label: label(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isId: /^[a-z0-9]{20,}$/i.test(seg),
  }));

  return (
    <nav aria-label="Navegação estrutural" className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50 flex-wrap">
      <Link href="/forum" className="flex items-center gap-1 hover:text-accent">
        <Home className="h-3.5 w-3.5" />
        Início
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 opacity-50" />
            {isLast || c.isId ? (
              <span className="text-black/70 dark:text-white/70 font-medium truncate max-w-[40vw]">
                {c.isId ? "Detalhe" : c.label}
              </span>
            ) : (
              <Link href={c.href} className="hover:text-accent">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
