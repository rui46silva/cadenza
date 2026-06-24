import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

const STEPS = [
  {
    emoji: "📝",
    title: "Cria a tua conta",
    description: "Regista-te gratuitamente e diz-nos o teu instrumento.",
  },
  {
    emoji: "🎬",
    title: "Partilha o teu trabalho",
    description: "Publica em texto ou vídeo no fórum, em qualquer estilo.",
  },
  {
    emoji: "🤝",
    title: "Recebe feedback",
    description: "Outros músicos comentam, votam e ajudam-te a evoluir.",
  },
];

const FAQS = [
  {
    question: "O Cadenza é gratuito?",
    answer:
      "Sim. Criar conta, participar no fórum e partilhar o teu trabalho é totalmente gratuito.",
  },
  {
    question: "Que estilos de música são bem-vindos?",
    answer:
      "Clássica, jazz, pop e tudo o que houver pelo meio — o Cadenza é para todos os músicos.",
  },
  {
    question: "Preciso de ser profissional para participar?",
    answer:
      "Não. O Cadenza serve tanto para alunos a aprender como para professores e profissionais.",
  },
];

async function getStats() {
  const [userCount, postCount, commentCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
  ]);
  return { userCount, postCount, commentCount };
}

export default async function LandingPage() {
  const stats = await getStats();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cadenza",
    description:
      "Plataforma para músicos de clássica, jazz e pop partilharem, aprenderem e crescerem juntos.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 flex flex-col gap-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      <section className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{stats.userCount}</p>
          <p className="text-sm text-black/60 dark:text-white/60">músicos</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.postCount}</p>
          <p className="text-sm text-black/60 dark:text-white/60">
            publicações
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.commentCount}</p>
          <p className="text-sm text-black/60 dark:text-white/60">
            comentários
          </p>
        </div>
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

      <section className="flex flex-col gap-6">
        <h2 className="text-center text-2xl font-bold">Como funciona</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-lg border border-black/10 dark:border-white/10 p-5"
            >
              <span className="text-xs font-medium text-black/40 dark:text-white/40">
                Passo {index + 1}
              </span>
              <div className="text-3xl mt-2">{step.emoji}</div>
              <h3 className="font-semibold mt-2">{step.title}</h3>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-center text-2xl font-bold">
          Perguntas frequentes
        </h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="rounded-lg border border-black/10 dark:border-white/10 p-4"
            >
              <summary className="cursor-pointer font-medium">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 rounded-lg border border-black/10 dark:border-white/10 p-8 text-center">
        <h2 className="text-2xl font-bold">Junta-te à comunidade</h2>
        <p className="max-w-md text-black/60 dark:text-white/60">
          Cria a tua conta gratuita e começa a partilhar o teu trabalho hoje.
        </p>
        <Link
          href="/register"
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 font-medium"
        >
          Criar conta
        </Link>
      </section>
    </div>
  );
}
