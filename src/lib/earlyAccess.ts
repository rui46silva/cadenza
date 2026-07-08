import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/emailLayout";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export { INVITE_COOKIE } from "@/lib/inviteCookie";

/**
 * Convida uma inscrição da lista de espera para o acesso antecipado: gera um
 * token (se ainda não existir), marca a data e envia o email com o link.
 */
export async function inviteWaitlistSignup(signup: {
  id: string;
  email: string;
  name: string | null;
  inviteToken: string | null;
}) {
  const token = signup.inviteToken ?? crypto.randomBytes(24).toString("hex");

  await prisma.waitlistSignup.update({
    where: { id: signup.id },
    data: { inviteToken: token, invitedAt: new Date() },
  });

  const inviteUrl = `${siteUrl}/convite/${token}`;
  const firstName = signup.name?.split(" ")[0];

  await sendEmail({
    to: signup.email,
    subject: "O teu acesso antecipado à Cadenza está aberto 🎉",
    html: renderEmail({
      heading: firstName ? `Chegou a tua vez, ${firstName}!` : "Chegou a tua vez! 🎉",
      intro:
        "Estás convidado para o acesso antecipado à Cadenza. Cria a tua conta e começa já a partilhar e a aprender com a comunidade.",
      cta: { label: "Criar a minha conta", url: inviteUrl },
      footnote: "Este convite é pessoal. Não o partilhes com outras pessoas.",
    }),
  });

  return token;
}
