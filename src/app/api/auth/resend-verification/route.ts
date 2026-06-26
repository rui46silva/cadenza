import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationEmail } from "@/lib/emailVerification";

const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, emailVerified: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ error: "O email já está verificado" }, { status: 400 });
  }

  const lastToken = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (lastToken && Date.now() - lastToken.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json(
      { error: "Aguarda um pouco antes de pedir outro email." },
      { status: 429 }
    );
  }

  await createAndSendVerificationEmail(user);

  return NextResponse.json({ ok: true });
}
