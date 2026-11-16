"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Flag,
  ListChecks,
  Tags,
  Newspaper,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Search,
  History,
  Menu,
  X,
} from "lucide-react";

type Access = "all" | "content" | "staff" | "admin";
type NavItem = { href: string; label: string; icon: typeof Users; access: Access; badge?: number };

function allowed(access: Access, role: string) {
  if (access === "all") return true;
  if (access === "admin") return role === "ADMIN";
  if (access === "content") return role === "ADMIN" || role === "EDITOR";
  return role === "ADMIN" || role === "MODERATOR";
}

export default function AdminSidebar({
  role,
  counts,
}: {
  role: string;
  counts: { reports: number; verifications: number; waitlist: number };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: "Geral",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, access: "all" }],
    },
    {
      label: "Conteúdo",
      items: [
        { href: "/admin/conteudo/noticias", label: "Notícias", icon: Newspaper, access: "content" },
        { href: "/admin/conteudo/vagas", label: "Vagas", icon: Briefcase, access: "content" },
        { href: "/admin/conteudo/paginas", label: "Páginas", icon: FileText, access: "content" },
        { href: "/admin/media", label: "Biblioteca de média", icon: ImageIcon, access: "content" },
        { href: "/admin/categorias", label: "Categorias e tags", icon: Tags, access: "staff" },
      ],
    },
    {
      label: "Comunidade",
      items: [
        { href: "/admin/utilizadores", label: "Utilizadores", icon: Users, access: "staff" },
        { href: "/admin/verificacoes", label: "Verificações", icon: BadgeCheck, access: "admin", badge: counts.verifications },
        { href: "/admin/denuncias", label: "Denúncias", icon: Flag, access: "staff", badge: counts.reports },
        { href: "/admin/lista-espera", label: "Lista de espera", icon: ListChecks, access: "admin", badge: counts.waitlist },
      ],
    },
    {
      label: "Crescimento",
      items: [
        { href: "/admin/seo", label: "SEO", icon: Search, access: "content" },
        { href: "/admin/atividade", label: "Registo de atividade", icon: History, access: "admin" },
      ],
    },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="flex flex-col gap-4 text-sm">
      {groups.map((g) => {
        const items = g.items.filter((i) => allowed(i.access, role));
        if (items.length === 0) return null;
        return (
          <div key={g.label} className="flex flex-col gap-0.5">
            <span className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-black/35 dark:text-white/35">
              {g.label}
            </span>
            {items.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
                  isActive(href)
                    ? "bg-accent/10 font-medium text-accent"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {badge ? (
                  <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
                    {badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile: botão para abrir o menu */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 flex items-center gap-2 rounded-md border border-black/15 dark:border-white/20 px-3 py-1.5 text-sm lg:hidden"
      >
        <Menu className="h-4 w-4" />
        Menu de administração
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl dark:bg-neutral-950">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Administração</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">{nav}</aside>
    </>
  );
}
