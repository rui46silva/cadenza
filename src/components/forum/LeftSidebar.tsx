import Link from "next/link";
import ResourcesDropdown from "@/components/forum/ResourcesDropdown";

const LINKS = [
  { href: "/popular", label: "🔥 Popular" },
  { href: "/noticias", label: "📰 Notícias" },
  { href: "/explorar", label: "🧭 Explorar" },
];

export default function LeftSidebar() {
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
        >
          {link.label}
        </Link>
      ))}
      <div className="my-2 border-t border-black/10 dark:border-white/10" />
      <ResourcesDropdown />
    </nav>
  );
}
