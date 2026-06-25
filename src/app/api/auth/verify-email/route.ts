import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/verificar-email?status=invalido`);
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return NextResponse.redirect(`${siteUrl}/verificar-email?status=invalido`);
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return NextResponse.redirect(`${siteUrl}/verificar-email?status=expirado`);
  }

  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: new Date() },
  });
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: verificationToken.userId },
  });

  return NextResponse.redirect(`${siteUrl}/verificar-email?status=sucesso`);
}
