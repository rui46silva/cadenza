import { MessagesSquare, GraduationCap, Trophy, Gift } from "lucide-react";
import Logo from "@/components/Logo";
import InstagramIcon from "@/components/InstagramIcon";
import TikTokIcon from "@/components/TikTokIcon";
import WaitlistForm from "@/components/WaitlistForm";
import Countdown from "@/components/Countdown";
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
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, icon: InstagramIcon, label: "Instagram" },
  { href: process.env.NEXT_PUBLIC_TIKTOK_URL, icon: TikTokIcon, label: "TikTok" },
].filter((s) => s.href);

function getInitials(email: string) {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export default async function ComingSoonPage() {
  const count = await prisma.waitlistSignup.count();
  const recentSignups = await prisma.waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { email: true },
  });
  const initials = recentSignups.map((s) => getInitials(s.email));
  const launchDate = process.env.NEXT_PUBLIC_LAUNCH_DATE;
  const limit = Number(process.env.NEXT_PUBLIC_WAITLIST_LIMIT) || undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <span className="flex items-center text-black dark:text-white">
        <Logo className="h-10 w-auto" />
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">
          O lugar onde os músicos <span className="text-accent">crescem juntos</span>
        </h1>
        <p className="max-w-md text-black/60 dark:text-white/60">
          Entra na lista de espera e garante acesso gratuito antecipado para
          partilhares o teu trabalho e aprenderes com outros músicos.
        </p>
      </div>

      {launchDate && <Countdown launchDate={launchDate} />}

      <WaitlistForm initialCount={count} limit={limit} initials={initials} />

      <p className="flex max-w-md items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
        <Gift className="h-4 w-4 shrink-0" />
        Os primeiros inscritos ganham a 1.ª masterclass do teu instrumento sem custo.
      </p>

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
            Não queres dar o teu email agora? Segue-nos:
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
