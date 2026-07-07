import Link from "next/link";
import { LayoutDashboard, UserPen, Settings, Inbox } from "lucide-react";

type Tab = { key: string; label: string; href: string; icon: typeof LayoutDashboard };

/**
 * Barra de separadores da área pessoal. Rola horizontalmente em ecrãs pequenos
 * para se manter totalmente responsiva.
 */
export default function DashboardNav({
  active,
  showAnswer,
}: {
  active: string;
  showAnswer: boolean;
}) {
  const tabs: Tab[] = [
    { key: "resumo", label: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
    { key: "editar", label: "Editar perfil", href: "/dashboard?tab=editar", icon: UserPen },
    {
      key: "preferencias",
      label: "Preferências",
      href: "/dashboard?tab=preferencias",
      icon: Settings,
    },
  ];
  if (showAnswer) {
    tabs.push({
      key: "responder",
      label: "Responder dúvidas",
      href: "/duvidas/responder",
      icon: Inbox,
    });
  }

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "border border-black/10 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-accent hover:text-accent"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
