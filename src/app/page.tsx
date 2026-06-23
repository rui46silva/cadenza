import Link from "next/link";

const SECTIONS = [
  {
    emoji: "💬",
    title: "Fórum",
    description:
      "Partilha o teu trabalho em texto ou vídeo, recebe feedback e ajuda outros músicos.",
    href: "/forum",
    available: true,
  },
  {
    emoji: "🎓",
    title: "E-learning",
    description:
      "Módulos e aulas dadas por professores, com provas em vídeo para avançar de nível.",
    href: undefined,
    available: false,
  },
  {
    emoji: "🏆",
    title: "Gamification",
    description:
      "XP, badges e leaderboard para tornar a aprendizagem mais motivante.",
    href: undefined,
    available: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-4 py-10 text-center">
        <span className="text-5xl">🎵</span>
        <h1 className="text-3xl sm:text-4xl font-bold">Cadenza</h1>
        <p className="max-w-xl text-black/60 dark:text-white/60">
          A plataforma para músicos de clássica, jazz e pop partilharem o seu
          trabalho, aprenderem com outros e crescerem juntos.
        </p>
        <Link
          href="/forum"
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 font-medium"
        >
          Entrar no Fórum
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => {
          const content = (
            <>
              <span className="text-3xl">{section.emoji}</span>
              <h2 className="font-semibold mt-2">{section.title}</h2>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                {section.description}
              </p>
              {!section.available && (
                <span className="mt-3 inline-block rounded-full border border-black/15 dark:border-white/20 px-2 py-0.5 text-xs text-black/50 dark:text-white/50">
                  brevemente
                </span>
              )}
            </>
          );

          const className =
            "rounded-lg border border-black/10 dark:border-white/10 p-5 transition-colors" +
            (section.available
              ? " hover:border-black/30 dark:hover:border-white/30"
              : " opacity-70");

          return section.href ? (
            <Link key={section.title} href={section.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={section.title} className={className}>
              {content}
            </div>
          );
        })}
      </section>
    </div>
  );
}
