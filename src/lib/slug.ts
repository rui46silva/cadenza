// Mapa de transliteração de caracteres acentuados/especiais para as letras
// base correspondentes (ç→c, ã→a, ñ→n, ...). Cobre também casos que a
// normalização Unicode (NFD) não decompõe (ø, ß, æ, œ, ...).
const TRANSLIT: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", ā: "a", ª: "a",
  è: "e", é: "e", ê: "e", ë: "e", ē: "e",
  ì: "i", í: "i", î: "i", ï: "i", ī: "i",
  ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o", ō: "o", º: "o",
  ù: "u", ú: "u", û: "u", ü: "u", ū: "u",
  ç: "c", ñ: "n", ý: "y", ÿ: "y",
  ß: "ss", æ: "ae", œ: "oe",
};

/**
 * Converte um texto num slug seguro para URLs (SEO-friendly): minúsculas, sem
 * acentos nem caracteres especiais (transliterados para as letras base), com
 * hífens em vez de espaços e só caracteres alfanuméricos.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    // Translitera caracteres especiais conhecidos (ç→c, ã→a, ...).
    .replace(/[àáâãäåāªèéêëēìíîïīòóôõöøōºùúûüūçñýÿßæœ]/g, (ch) => TRANSLIT[ch] ?? ch)
    // Remove quaisquer marcas de acento remanescentes via decomposição Unicode.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
