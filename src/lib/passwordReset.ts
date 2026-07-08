import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/emailLayout";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Cria um token de reposição e envia o email. Silencioso quando o email não
 * existe, para não revelar quem tem conta.
 */
export async function createAndSendPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
  if (!user) return;

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const resetUrl = `${siteUrl}/redefinir-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Repor a tua palavra-passe — Cadenza",
    html: renderEmail({
      heading: `Olá ${user.name}`,
      intro:
        "Recebemos um pedido para repor a tua palavra-passe. Carrega no botão para escolher uma nova.",
      cta: { label: "Repor palavra-passe", url: resetUrl },
      footnote:
        "Este link expira em 1 hora. Se não pediste isto, podes ignorar este email — a tua palavra-passe continua a mesma.",
    }),
  });
}

/**
 * Valida o token e define a nova palavra-passe. Devolve true em sucesso.
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) return false;

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return true;
}
