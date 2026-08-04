import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as respostas.
// Nota: não forçamos uma CSP estrita para não partir os scripts inline
// necessários (gtag, tema anti-flash, JSON-LD) nem o AdSense/Turnstile.
const securityHeaders = [
  // Força HTTPS durante 2 anos, incluindo subdomínios.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Impede o browser de "adivinhar" o tipo de conteúdo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Anti-clickjacking (não permitir enquadrar o site noutro domínio).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Não vazar o URL completo como referrer para outros sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desliga APIs sensíveis que não usamos.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
