import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "Cadenza <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY não configurada. Email para ${to}:\n${subject}\n${html}`);
    return;
  }

  await resend.emails.send({ from, to, subject, html });
}
