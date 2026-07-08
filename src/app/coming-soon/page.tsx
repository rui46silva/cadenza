import { MessagesSquare, GraduationCap, Trophy, Gift } from "lucide-react";
import Logo from "@/components/Logo";
import InstagramIcon from "@/components/InstagramIcon";
import FacebookIcon from "@/components/FacebookIcon";
import WaitlistForm from "@/components/WaitlistForm";
import Countdown from "@/components/Countdown";
import ThemeToggle from "@/components/ThemeToggle";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Brevemente",
};

const FEATURES = [
  { icon: MessagesSquare, label: "Fórum para partilhar e dar feedback" },
  { icon: GraduationCap, label: "Aulas e módulos de e-learning" },
  { icon: Trophy, label: "Conquistas e gamification" },
];

const SOCIAL_LINKS = [
  {
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/cadenza.pt",
    icon: InstagramIcon,
    label: "Instagram @cadenza.pt",
  },
  {
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com/cadenza.pt",
    icon: FacebookIcon,
    label: "Facebook @cadenza.pt",
  },
];

// Iniciais a partir do primeiro e último nome; recorre ao email se não houver nome.
function getInitials(name: string | null, email: string) {
  const clean = name?.trim();
  if (clean) {
    const parts = clean.split(/\s+/).filter(Boolean);
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }
  const local = email.split("@")[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

// A lista de espera pode ser desligada (ex: antes do lançamento nas redes).
// Ativa com NEXT_PUBLIC_WAITLIST_ENABLED="true".
const WAITLIST_ENABLED = process.env.NEXT_PUBLIC_WAITLIST_ENABLED === "true";

export default async function ComingSoonPage() {
  const launchDate = process.env.NEXT_PUBLIC_LAUNCH_DATE;
  const limit = Number(process.env.NEXT_PUBLIC_WAITLIST_LIMIT) || undefined;

  // Só consulta a base de dados quando a lista de espera está ativa.
  let count = 0;
  let initials: string[] = [];
  if (WAITLIST_ENABLED) {
    count = await prisma.waitlistSignup.count();
    const recentSignups = await prisma.waitlistSignup.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { email: true, name: true },
    });
    initials = recentSignups.map((s) => getInitials(s.name, s.email));
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <span className="flex items-center text-black dark:text-white">
        <Logo className="h-10 w-auto" />
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">
          O lugar onde os músicos <span className="text-accent">crescem juntos</span>
        </h1>
        <p className="max-w-md text-black/60 dark:text-white/60">
          {WAITLIST_ENABLED
            ? "Entra na lista de espera e garante acesso antecipado ao fórum, totalmente gratuito, para partilhares o teu trabalho e aprenderes com outros músicos."
            : "Estamos a preparar o fórum onde vais partilhar o teu trabalho, receber feedback e crescer com outros músicos. Brevemente."}
        </p>
      </div>

      {launchDate && <Countdown launchDate={launchDate} />}

      {WAITLIST_ENABLED && (
        <>
          <WaitlistForm initialCount={count} limit={limit} initials={initials} />
          <p className="flex max-w-md items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
            <Gift className="h-4 w-4 shrink-0" />
            Os primeiros inscritos ganham a 1.ª masterclass do teu instrumento sem custo.
          </p>
        </>
      )}

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

      {SOCIAL_LINKS.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-black/40 dark:text-white/40">
            {WAITLIST_ENABLED
              ? "Não queres dar o teu email agora? Segue-nos:"
              : "Segue-nos para não perderes o lançamento:"}
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/10 hover:border-accent hover:text-accent"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-black/40 dark:text-white/40">
        © {new Date().getFullYear()} Cadenza. Todos os direitos reservados.
      </p>
    </main>
  );
}
