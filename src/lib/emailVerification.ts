import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function createAndSendVerificationEmail(user: { id: string; name: string; email: string }) {
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const verifyUrl = `${siteUrl}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Confirma o teu email — Cadenza",
    html: `
      <p>Olá ${user.name},</p>
      <p>Bem-vindo à Cadenza! Confirma o teu email para ativares a tua conta:</p>
      <p><a href="${verifyUrl}">Confirmar o meu email</a></p>
      <p>Este link expira em 24 horas.</p>
    `,
  });
}
