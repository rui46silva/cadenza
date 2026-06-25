import Link from "next/link";
import {
  MessagesSquare,
  GraduationCap,
  Trophy,
  UserPlus,
  Share2,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonPrimary, card } from "@/lib/ui";

const SECTIONS = [
  {
    icon: MessagesSquare,
    title: "Fórum",
    description:
      "Partilha o teu trabalho em texto ou vídeo, recebe feedback e ajuda outros músicos.",
    href: "/forum",
    available: true,
  },
  {
    icon: GraduationCap,
    title: "E-learning",
    description:
      "Módulos e aulas dadas por professores, com provas em vídeo para avançar de nível.",
    href: undefined,
    available: false,
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "XP, badges e leaderboard para tornar a aprendizagem mais motivante.",
    href: undefined,
    available: false,
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Cria a tua conta",
    description: "Regista-te gratuitamente e diz-nos o teu instrumento.",
  },
  {
    icon: Share2,
    title: "Partilha o teu trabalho",
    description: "Publica em texto ou vídeo no fórum, em qualquer estilo.",
  },
  {
    icon: Users,
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

      <section className="grid items-center gap-8 py-10 sm:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Comunidade de músicos
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Partilha a tua música. Cresce com a comunidade.
          </h1>
          <p className="max-w-md text-black/60 dark:text-white/60">
            O Cadenza junta músicos de clássica, jazz e pop num só sítio para
            partilharem o seu trabalho, aprenderem uns com os outros e
            evoluírem juntos.
          </p>
          <Link href="/forum" className={`${buttonPrimary} w-fit`}>
            Entrar no Fórum
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 rounded-xl border border-black/10 dark:border-white/10 p-5">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.userCount}</p>
            <p className="text-xs text-black/60 dark:text-white/60">
              músicos
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.postCount}</p>
            <p className="text-xs text-black/60 dark:text-white/60">
              publicações
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.commentCount}</p>
            <p className="text-xs text-black/60 dark:text-white/60">
              comentários
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const content = (
            <>
              <Icon className="h-6 w-6 text-accent" />
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

          const className = card + (section.available ? "" : " opacity-70");

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
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-lg border border-black/10 dark:border-white/10 p-5"
              >
                <span className="text-xs font-medium text-black/40 dark:text-white/40">
                  Passo {index + 1}
                </span>
                <Icon className="h-6 w-6 text-accent mt-2" />
                <h3 className="font-semibold mt-2">{step.title}</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                  {step.description}
                </p>
              </div>
            );
          })}
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
        <Link href="/register" className={buttonPrimary}>
          Criar conta
        </Link>
      </section>
    </div>
  );
}
