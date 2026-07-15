"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import { useBreadcrumbTitle } from "@/components/BreadcrumbTitle";

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

// Segmentos que NÃO têm página índice própria (só rotas de detalhe). Nas
// breadcrumbs aparecem como texto simples, nunca como link (evita 404).
const NO_INDEX_SEGMENTS = new Set(["posts", "perfil"]);

export default function Breadcrumbs() {
  const pathname = usePathname();
  const detailTitle = useBreadcrumbTitle();
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
    // Sem página índice → não navegável.
    noLink: NO_INDEX_SEGMENTS.has(seg),
  }));

  return (
    <nav aria-label="Navegação estrutural" className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50 flex-wrap">
      <Link href="/forum" className="flex items-center gap-1 hover:text-accent">
        <Home className="h-3.5 w-3.5" />
        Início
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        // No último item de uma página de detalhe, mostra o título real
        // (post/notícia) em vez do slug/id.
        const lastLabel = detailTitle ?? (c.isId ? "Detalhe" : c.label);
        return (
          <span key={c.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 opacity-50" />
            {isLast || c.isId || c.noLink ? (
              <span
                className={
                  isLast || c.isId
                    ? "text-black/70 dark:text-white/70 font-medium truncate max-w-[40vw]"
                    : "truncate max-w-[40vw]"
                }
              >
                {isLast ? lastLabel : c.isId ? "Detalhe" : c.label}
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
