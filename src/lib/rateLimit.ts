const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiter simples em memória (por instância do servidor) — suficiente para
 * travar rajadas óbvias de bots num formulário público sem precisar de infraestrutura extra.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// --- Bloqueio progressivo de login (anti credential-stuffing) ---
// NOTA: como o `buckets` é em memória (por instância), isto trava rajadas óbvias
// mas não é à prova de ataque distribuído no Vercel serverless. Para proteção
// robusta, mover para um store partilhado (ex: Upstash Redis).
const loginFails = new Map<string, { count: number; resetAt: number }>();
const LOGIN_MAX_FAILS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** Devolve true se esta chave (ex: `login:<ip>`) está temporariamente bloqueada. */
export function isLoginLocked(key: string): boolean {
  const entry = loginFails.get(key);
  if (!entry || entry.resetAt < Date.now()) return false;
  return entry.count >= LOGIN_MAX_FAILS;
}

/** Regista uma tentativa de login falhada. */
export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const entry = loginFails.get(key);
  if (!entry || entry.resetAt < now) {
    loginFails.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

/** Limpa o contador após um login bem-sucedido. */
export function clearLoginFailures(key: string): void {
  loginFails.delete(key);
}
