// Renderizador de Markdown leve e seguro para o conteúdo do CMS.
// Todo o HTML do autor é escapado primeiro; só geramos as tags suportadas
// e só aceitamos URLs http(s), mailto ou relativas em links e imagens.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(raw: string): string | null {
  const url = raw.trim();
  if (/^(https?:\/\/|mailto:|\/(?!\/))/i.test(url)) return url;
  return null;
}

// Formatação dentro de uma linha (o texto já vem escapado).
function inline(text: string): string {
  let out = text;
  // Imagens ![alt](url)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => {
    const safe = safeUrl(url.replace(/&amp;/g, "&"));
    return safe
      ? `<img src="${escapeHtml(safe)}" alt="${alt}" loading="lazy" class="my-3 max-w-full rounded-lg" />`
      : alt;
  });
  // Links [texto](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
    const safe = safeUrl(url.replace(/&amp;/g, "&"));
    if (!safe) return label;
    const external = /^https?:\/\//i.test(safe);
    return `<a href="${escapeHtml(safe)}"${external ? ' target="_blank" rel="noopener noreferrer nofollow"' : ""} class="text-accent underline">${label}</a>`;
  });
  // Código `x`
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-black/5 px-1 dark:bg-white/10">$1</code>');
  // Negrito **x** e itálico *x* / _x_
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  out = out.replace(/(^|\s)_([^_]+)_(?=\s|$|[.,!?;:])/g, "$1<em>$2</em>");
  return out;
}

/** Converte Markdown (subconjunto) em HTML seguro. */
export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  const lines = escapeHtml(md.replace(/\r\n/g, "\n")).split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${paragraph.map(inline).join("<br />")}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      const cls = list.type === "ul" ? "list-disc" : "list-decimal";
      html.push(`<${list.type} class="${cls} pl-6">${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.type}>`);
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      html.push(`<blockquote class="border-l-4 border-accent/50 pl-4 italic text-black/70 dark:text-white/70">${quote.map(inline).join("<br />")}</blockquote>`);
      quote = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushAll();
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length + 1; // # → h2 (o h1 é o título da página)
      const size = level === 2 ? "text-xl" : level === 3 ? "text-lg" : "text-base";
      html.push(`<h${level} class="${size} font-bold mt-2">${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushAll();
      html.push('<hr class="my-4 border-black/10 dark:border-white/10" />');
      continue;
    }
    const quoteLine = /^&gt;\s?(.*)$/.exec(line);
    if (quoteLine) {
      flushParagraph();
      flushList();
      quote.push(quoteLine[1]);
      continue;
    }
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushParagraph();
      flushQuote();
      const type = ul ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ul ?? ol)![1]);
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line);
  }
  flushAll();
  return html.join("\n");
}

/** Texto simples (sem marcação) — útil para resumos e análise SEO. */
export function markdownToText(md: string | null | undefined): string {
  if (!md) return "";
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
