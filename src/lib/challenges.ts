/**
 * Desafios semanais — rodam automaticamente por semana ISO. Cada semana mostra
 * um tema; quem publica ganha o distintivo de participação. O `id` da semana
 * (ex: "2026-W28") é guardado em Post.challengeId para contar participações.
 */
const CHALLENGES: { title: string; prompt: string }[] = [
  {
    title: "Grava 30 segundos a tocar",
    prompt: "Partilha um clip curto de ti a tocar o teu instrumento — sem edições, cru e verdadeiro.",
  },
  {
    title: "Mostra o teu setup",
    prompt: "Uma foto ou vídeo do teu espaço de estudo/ensaio. O que não pode faltar?",
  },
  {
    title: "A peça que estás a trabalhar",
    prompt: "Que peça andas a estudar esta semana? Partilha um excerto e o que te está a dar luta.",
  },
  {
    title: "Um truque que mudou o teu tocar",
    prompt: "Partilha uma dica técnica ou de estudo que fez diferença para ti.",
  },
  {
    title: "Toca de ouvido",
    prompt: "Escolhe uma melodia conhecida e toca-a de ouvido. Mostra o resultado!",
  },
  {
    title: "Cover livre",
    prompt: "Grava a tua versão de uma música que adoras. O género é à tua escolha.",
  },
];

function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export type Challenge = {
  id: string;
  title: string;
  prompt: string;
  tag: string;
};

export function currentChallenge(date = new Date()): Challenge {
  const { year, week } = isoWeek(date);
  const index =
    (year * 53 + week) % CHALLENGES.length;
  const base = CHALLENGES[index];
  return {
    id: `${year}-W${String(week).padStart(2, "0")}`,
    title: base.title,
    prompt: base.prompt,
    tag: "desafio-da-semana",
  };
}
