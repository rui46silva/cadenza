import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { INVITE_COOKIE } from "@/lib/inviteCookie";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Dá a um administrador autenticado acesso à plataforma mesmo com o modo
 * "brevemente" (coming soon) ativo: define o cookie que o proxy reconhece e
 * encaminha para o fórum. Se não for admin, volta para o login.
 */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", siteUrl));
  }

  const res = NextResponse.redirect(new URL("/forum", siteUrl));
  res.cookies.set(INVITE_COOKIE, "admin", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  });
  return res;
}
