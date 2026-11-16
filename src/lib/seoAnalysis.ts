// Análise SEO estilo Yoast: recebe os campos de uma página/artigo e devolve uma
// lista de verificações com semáforo (bom/ok/mau). Tudo síncrono e sem estado,
// para correr ao vivo no editor.

export type SeoCheckStatus = "good" | "ok" | "bad";

export type SeoCheck = {
  id: string;
  status: SeoCheckStatus;
  message: string;
};

export type SeoInput = {
  title?: string | null;
  metaDescription?: string | null;
  slug?: string | null;
  content?: string | null;
  focusKeyword?: string | null;
};

// Limites recomendados (aprox. aos do Google/Yoast).
export const TITLE_MIN = 30;
export const TITLE_MAX = 60;
export const DESC_MIN = 120;
export const DESC_MAX = 156;

function includesKeyword(text: string | null | undefined, kw: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(kw.toLowerCase());
}

/** Classifica o comprimento de um texto face a um intervalo ideal. */
export function lengthStatus(len: number, min: number, max: number): SeoCheckStatus {
  if (len === 0) return "bad";
  if (len < min) return "ok";
  if (len > max) return "ok";
  return "good";
}

export function analyzeSeo(input: SeoInput): SeoCheck[] {
  const checks: SeoCheck[] = [];
  const title = (input.title ?? "").trim();
  const desc = (input.metaDescription ?? "").trim();
  const slug = (input.slug ?? "").trim();
  const content = (input.content ?? "").trim();
  const kw = (input.focusKeyword ?? "").trim();

  // Título
  if (!title) {
    checks.push({ id: "title", status: "bad", message: "Define um título SEO." });
  } else if (title.length < TITLE_MIN) {
    checks.push({ id: "title", status: "ok", message: `Título curto (${title.length}). Ideal ${TITLE_MIN}–${TITLE_MAX}.` });
  } else if (title.length > TITLE_MAX) {
    checks.push({ id: "title", status: "ok", message: `Título longo (${title.length}). Pode ser cortado no Google.` });
  } else {
    checks.push({ id: "title", status: "good", message: `Título com bom comprimento (${title.length}).` });
  }

  // Meta-descrição
  if (!desc) {
    checks.push({ id: "desc", status: "bad", message: "Escreve uma meta-descrição." });
  } else if (desc.length < DESC_MIN) {
    checks.push({ id: "desc", status: "ok", message: `Descrição curta (${desc.length}). Ideal ${DESC_MIN}–${DESC_MAX}.` });
  } else if (desc.length > DESC_MAX) {
    checks.push({ id: "desc", status: "ok", message: `Descrição longa (${desc.length}). Pode ser cortada.` });
  } else {
    checks.push({ id: "desc", status: "good", message: `Descrição com bom comprimento (${desc.length}).` });
  }

  // Palavra-chave de foco
  if (!kw) {
    checks.push({ id: "keyword", status: "ok", message: "Define uma palavra-chave de foco para análise mais completa." });
    return checks;
  }

  checks.push({
    id: "kw-title",
    status: includesKeyword(title, kw) ? "good" : "bad",
    message: includesKeyword(title, kw)
      ? "A palavra-chave aparece no título."
      : "A palavra-chave não aparece no título.",
  });
  checks.push({
    id: "kw-desc",
    status: includesKeyword(desc, kw) ? "good" : "ok",
    message: includesKeyword(desc, kw)
      ? "A palavra-chave aparece na meta-descrição."
      : "A palavra-chave não aparece na meta-descrição.",
  });
  if (slug) {
    checks.push({
      id: "kw-slug",
      status: includesKeyword(slug, kw.replace(/\s+/g, "-")) || includesKeyword(slug, kw)
        ? "good"
        : "ok",
      message: "A palavra-chave no URL (slug) ajuda o SEO.",
    });
  }
  if (content) {
    checks.push({
      id: "kw-content",
      status: includesKeyword(content, kw) ? "good" : "ok",
      message: includesKeyword(content, kw)
        ? "A palavra-chave aparece no corpo."
        : "A palavra-chave não aparece no corpo do texto.",
    });
  }

  return checks;
}

/** Pontuação global simples (0–100) a partir das verificações. */
export function seoScore(checks: SeoCheck[]): number {
  if (checks.length === 0) return 0;
  const weight = { good: 1, ok: 0.5, bad: 0 };
  const total = checks.reduce((s, c) => s + weight[c.status], 0);
  return Math.round((total / checks.length) * 100);
}
