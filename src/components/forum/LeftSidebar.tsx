import Link from "next/link";
import { Flame, Newspaper, Compass } from "lucide-react";
import ResourcesDropdown from "@/components/forum/ResourcesDropdown";

const LINKS = [
  { href: "/popular", label: "Popular", icon: Flame },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/explorar", label: "Explorar", icon: Compass },
];

export default function LeftSidebar() {
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon className="h-4 w-4 text-accent" />
          {label}
        </Link>
      ))}
      <div className="my-2 border-t border-black/10 dark:border-white/10" />
      <ResourcesDropdown />
    </nav>
  );
}
