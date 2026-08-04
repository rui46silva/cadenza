export const COMMON_INSTRUMENTS = [
  "Piano",
  "Teclado",
  "Sintetizador",
  "Guitarra",
  "Guitarra clássica",
  "Guitarra elétrica",
  "Baixo",
  "Violino",
  "Viola",
  "Violoncelo",
  "Contrabaixo",
  "Bateria",
  "Percussão",
  "Cajón",
  "Saxofone",
  "Trompete",
  "Trombone",
  "Trompa",
  "Tuba",
  "Clarinete",
  "Flauta",
  "Flautim",
  "Oboé",
  "Corne-inglês",
  "Fagote",
  "Contrafagote",
  "Saxhorn",
  "Bombardino",
  "Bombo",
  "Pratos",
  "Tímpanos",
  "Xilofone",
  "Marimba",
  "Vibrafone",
  "Caixa",
  "Lira",
  "Voz",
  "Acordeão",
  "Harpa",
  "Órgão",
  "Ukulele",
  "Cavaquinho",
  "Bandolim",
  "Banjo",
  "Gaita-de-foles",
  "Gaita de beiços",
  "Concertina",
];

/**
 * Converte um texto de instrumentos separados por vírgula numa lista limpa:
 * remove espaços, entradas vazias e duplicados (sem distinguir maiúsculas).
 */
export function parseInstruments(input?: string | null): string[] {
  if (!input) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of input.split(",")) {
    const name = raw.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}
