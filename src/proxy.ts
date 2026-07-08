import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDemoHost } from "@/lib/demoHost";
import { INVITE_COOKIE } from "@/lib/inviteCookie";

const ALLOWED_PREFIXES = [
  "/coming-soon",
  "/login",
  "/recuperar-password",
  "/redefinir-password",
  "/convite",
  "/admin",
  "/api/auth",
  "/api/waitlist",
];

function next(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host");

  if (isDemoHost(hostname)) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/demo", req.url));
    }
    // O subdomínio de demo ignora o modo "brevemente" para os embaixadores
    // conseguirem explorar a plataforma toda, mesmo com o domínio principal fechado.
    return next(req);
  }

  if (process.env.COMING_SOON !== "true") {
    return next(req);
  }

  if (ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return next(req);
  }

  // Quem tem convite de acesso antecipado (cookie definido em /convite/[token])
  // pode entrar na plataforma toda, mesmo com o modo "brevemente" ativo.
  if (req.cookies.get(INVITE_COOKIE)) {
    return next(req);
  }

  return NextResponse.redirect(new URL("/coming-soon", req.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|ads.txt).*)"],
};
