import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDemoHost } from "@/lib/demoHost";

const ALLOWED_PREFIXES = [
  "/coming-soon",
  "/login",
  "/admin",
  "/api/auth",
  "/api/waitlist",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host");

  if (isDemoHost(hostname)) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/demo", req.url));
    }
    // O subdomínio de demo ignora o modo "brevemente" para os embaixadores
    // conseguirem explorar a plataforma toda, mesmo com o domínio principal fechado.
    return NextResponse.next();
  }

  if (process.env.COMING_SOON !== "true") {
    return NextResponse.next();
  }

  if (ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/coming-soon", req.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|ads.txt).*)"],
};
