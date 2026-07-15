import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

// Páginas fixas cuja meta é gerível pelo admin no CMS de SEO. O `path` é a rota
// (imutável); só o título e a descrição são editáveis.
export const MANAGED_PAGES: {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
}[] = [
  {
    path: "/forum",
    label: "Fórum",
    defaultTitle: "Fórum",
    defaultDescription:
      "Partilha o teu trabalho, pede opiniões e ajuda outros músicos a crescer no fórum Cadenza.",
  },
  {
    path: "/popular",
    label: "Popular",
    defaultTitle: "Popular",
    defaultDescription: "Os posts com mais votos no fórum da Cadenza.",
  },
  {
    path: "/explorar",
    label: "Explorar",
    defaultTitle: "Explorar",
    defaultDescription: "Explora tópicos, instrumentos e a comunidade da Cadenza.",
  },
  {
    path: "/noticias",
    label: "Notícias",
    defaultTitle: "Notícias",
    defaultDescription:
      "Novidades do mundo da música, artigos e histórias selecionadas para a comunidade Cadenza.",
  },
  {
    path: "/vagas",
    label: "Vagas e oportunidades",
    defaultTitle: "Vagas e oportunidades",
    defaultDescription:
      "Vagas em orquestras, bandas filarmónicas, coros e projetos musicais. Encontra a tua próxima oportunidade na Cadenza.",
  },
  {
    path: "/professores",
    label: "Profissionais",
    defaultTitle: "Professores e profissionais",
    defaultDescription:
      "Diretório de professores certificados e músicos profissionais verificados da Cadenza — tira as tuas dúvidas diretamente com eles.",
  },
  {
    path: "/embaixadores",
    label: "Embaixadores",
    defaultTitle: "Embaixadores",
    defaultDescription:
      "Conhece os embaixadores da Cadenza — músicos que ajudam a comunidade a crescer todos os dias.",
  },
  {
    path: "/ranking",
    label: "Ranking",
    defaultTitle: "Ranking",
    defaultDescription: "O ranking da comunidade Cadenza — do mês e de sempre.",
  },
  {
    path: "/premium",
    label: "Premium",
    defaultTitle: "Cadenza Premium",
    defaultDescription:
      "Apoia a Cadenza e desbloqueia vantagens: distintivo Premium, perfil em destaque, sem anúncios e mais.",
  },
];

/**
 * Gera o objeto Metadata de uma página, aplicando a override do admin (se
 * existir) sobre os valores por omissão. A tabela é pequena e indexada por
 * `path`, por isso consultamos diretamente para as alterações serem imediatas.
 */
export async function pageMetadata(
  path: string,
  fallback: { title: string; description: string }
): Promise<Metadata> {
  const row = await prisma.pageMeta.findUnique({ where: { path } });
  const title = row?.title?.trim() || fallback.title;
  const description = row?.metaDescription?.trim() || fallback.description;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, type: "website", url: path },
  };
}
