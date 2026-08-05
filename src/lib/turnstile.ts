/**
 * Verificação do Cloudflare Turnstile (CAPTCHA anti-bot).
 *
 * Fica INERTE enquanto a variável de ambiente `TURNSTILE_SECRET_KEY` não estiver
 * definida — assim o código pode ir para produção sem fricção e só passa a
 * exigir CAPTCHA quando adicionares as chaves. Para ativar:
 *   1. Cria um widget Turnstile em dash.cloudflare.com (grátis).
 *   2. Define `TURNSTILE_SECRET_KEY` (server) e `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (client).
 */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token?: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Sem chave configurada → CAPTCHA desligado (não bloqueia).
  if (!secret) return true;
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip && ip !== "unknown") form.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, { method: "POST", body: form });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("turnstile verify failed", err);
    return false;
  }
}
