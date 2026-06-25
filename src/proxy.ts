import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_PREFIXES = ["/coming-soon", "/login", "/admin", "/api/auth"];

export function proxy(req: NextRequest) {
  if (process.env.COMING_SOON !== "true") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  if (ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/coming-soon", req.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|ads.txt).*)"],
};
