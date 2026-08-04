import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/emailLayout";

type Signup = { email: string; name?: string | null; instrument?: string | null };

/**
 * Envia o email de confirmação da lista de espera. Lança em caso de erro para
 * quem chama poder tratar (ex: não marcar como enviado).
 */
export async function sendWaitlistConfirmation(signup: Signup) {
  const firstName = signup.name?.split(" ")[0];
  await sendEmail({
    to: signup.email,
    subject: "Estás na lista de espera da Cadenza 🎶",
    html: renderEmail({
      heading: firstName ? `Obrigado, ${firstName}!` : "Estás na lista! 🎉",
      intro:
        "Guardámos o teu lugar na lista de espera da Cadenza. Vais ser das primeiras pessoas a entrar no fórum quando o acesso antecipado abrir.",
      bodyHtml: signup.instrument
        ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Também te avisamos quando houver uma masterclass de <strong>${signup.instrument}</strong>.</p>`
        : undefined,
      footnote: "Enquanto esperas, segue-nos nas redes sociais para não perderes novidades.",
    }),
  });
}

/**
 * Reenvia o email de confirmação a inscritos da lista de espera. Por omissão só
 * envia a quem ainda não recebeu (confirmationSentAt = null); com `force` reenvia
 * a todos. Envia em série com uma pequena pausa para respeitar limites do Resend.
 */
export async function resendWaitlistConfirmations({ force = false }: { force?: boolean } = {}) {
  const signups = await prisma.waitlistSignup.findMany({
    where: force ? {} : { confirmationSentAt: null },
    select: { id: true, email: true, name: true, instrument: true },
  });

  let sent = 0;
  let failed = 0;
  for (const signup of signups) {
    try {
      await sendWaitlistConfirmation(signup);
      await prisma.waitlistSignup.update({
        where: { id: signup.id },
        data: { confirmationSentAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error("resend waitlist email failed", signup.email, err);
      failed++;
    }
    // Pausa curta entre envios para não exceder o rate limit do Resend.
    await new Promise((r) => setTimeout(r, 120));
  }

  return { total: signups.length, sent, failed };
}
