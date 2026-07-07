import Link from "next/link";
import { FileText, Video, HelpCircle, Music } from "lucide-react";
import Avatar from "@/components/Avatar";

const QUICK = [
  { href: "/posts/new", label: "Post", icon: FileText, color: "text-accent" },
  { href: "/posts/new", label: "Vídeo", icon: Video, color: "text-rose-500" },
  { href: "/posts/new?duvida=1", label: "Dúvida", icon: HelpCircle, color: "text-sky-500" },
  { href: "/posts/new?feedback=1", label: "Feedback", icon: Music, color: "text-fuchsia-500" },
];

/**
 * Caixa de criação de post no topo do fórum, ao estilo do Facebook: um campo
 * grande que abre o editor e atalhos rápidos por tipo. Substitui o botão "Novo
 * post" da navbar, deixando a criação mais intuitiva e visível.
 */
export default function PostComposer({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const firstName = name.split(" ")[0];

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} avatarUrl={avatarUrl} size={40} />
        <Link
          href="/posts/new"
          className="flex-1 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 px-4 py-2.5 text-sm text-black/50 dark:text-white/50 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          O que queres partilhar, {firstName}?
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1 border-t border-black/10 dark:border-white/10 pt-2">
        {QUICK.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-black/60 dark:text-white/60 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon className={`h-4.5 w-4.5 ${color}`} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
