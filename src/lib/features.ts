/**
 * Flags de funcionalidades. A subscrição Premium fica desligada por omissão
 * (em stand-by) e só aparece em produção quando NEXT_PUBLIC_PREMIUM_ENABLED
 * for "true". Assim o resto das alterações pode ir para produção sem expor o
 * Premium antes de estar pronto (ex: pagamento).
 */
export const PREMIUM_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_ENABLED === "true";
