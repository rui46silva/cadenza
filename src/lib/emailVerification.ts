import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/emailLayout";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadenza.pt";

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
    html: renderEmail({
      heading: `Olá ${user.name} 👋`,
      intro:
        "Bem-vindo à Cadenza! Falta só um passo: confirma o teu email para ativares a tua conta.",
      cta: { label: "Confirmar o meu email", url: verifyUrl },
      footnote: "Este link expira em 24 horas. Se não criaste esta conta, ignora este email.",
    }),
  });
}
