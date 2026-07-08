import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INVITE_COOKIE } from "@/lib/earlyAccess";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Link pessoal de acesso antecipado. Valida o token, guarda um cookie que abre
 * a plataforma (ver proxy.ts) e encaminha para o registo com o email preenchido.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const signup = await prisma.waitlistSignup.findUnique({
    where: { inviteToken: token },
    select: { email: true },
  });

  if (!signup) {
    return NextResponse.redirect(new URL("/coming-soon", siteUrl));
  }

  const url = new URL("/register", siteUrl);
  url.searchParams.set("email", signup.email);
  url.searchParams.set("convite", "1");

  const res = NextResponse.redirect(url);
  res.cookies.set(INVITE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  });
  return res;
}
