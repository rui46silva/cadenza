import Link from "next/link";
import { MessagesSquare, Flame, Newspaper, Compass, LayoutGrid, Sparkles, HelpCircle, GraduationCap, Trophy, Music, Briefcase } from "lucide-react";
import ResourcesDropdown from "@/components/forum/ResourcesDropdown";

// Mesma hierarquia de assuntos do LeftSidebar.
const GROUPS: { label: string; links: { href: string; label: string; icon: typeof Flame }[] }[] = [
  {
    label: "Comunidade",
    links: [
      { href: "/forum", label: "Fórum", icon: MessagesSquare },
      { href: "/popular", label: "Popular", icon: Flame },
      { href: "/explorar", label: "Explorar", icon: Compass },
      { href: "/categorias", label: "Categorias", icon: LayoutGrid },
    ],
  },
  {
    label: "Aprender",
    links: [
      { href: "/desafios", label: "Desafio da semana", icon: Trophy },
      { href: "/feedback", label: "Feedback", icon: Music },
      { href: "/duvidas", label: "Dúvidas", icon: HelpCircle },
    ],
  },
  {
    label: "Pessoas",
    links: [
      { href: "/embaixadores", label: "Embaixadores", icon: Sparkles },
      { href: "/professores", label: "Profissionais", icon: GraduationCap },
    ],
  },
  {
    label: "Novidades",
    links: [
      { href: "/noticias", label: "Notícias", icon: Newspaper },
      { href: "/vagas", label: "Vagas e oportunidades", icon: Briefcase },
    ],
  },
];

/**
 * Navegação leve para o menu mobile — mesmos destinos do LeftSidebar, mas sem
 * os widgets que dependem de dados (tópicos populares, leaderboard, ads), para
 * não obrigar todas as páginas a esperar por essas queries só para mostrar o menu.
 */
export default function MobileNavLinks() {
  return (
    <nav className="flex flex-col gap-3 text-sm">
      {GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <span className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-black/35 dark:text-white/35">
            {group.label}
          </span>
          {group.links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </Link>
          ))}
        </div>
      ))}
      <div className="my-1 border-t border-black/10 dark:border-white/10" />
      <ResourcesDropdown />
    </nav>
  );
}
