/**
 * Converte um texto num slug seguro para URLs (SEO-friendly): minúsculas, sem
 * acentos, com hífens em vez de espaços e só caracteres alfanuméricos.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
