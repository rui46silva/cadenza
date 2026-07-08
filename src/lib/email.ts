import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Remetente: por defeito usa o domínio da Cadenza (tem de estar verificado no
// Resend). Pode ser sobreposto por EMAIL_FROM. As respostas vão para geral@.
const from = process.env.EMAIL_FROM ?? "Cadenza <noreply@cadenza.pt>";
const replyTo = process.env.EMAIL_REPLY_TO ?? "geral@cadenza.pt";

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

  // A SDK do Resend não lança erro — devolve { data, error }. Tornamos o erro
  // visível nos logs (e propagamos) para não falhar em silêncio.
  const { data, error } = await resend.emails.send({ from, to, replyTo, subject, html });
  if (error) {
    console.error("[email] Resend recusou o envio:", error);
    throw new Error(typeof error === "string" ? error : error.message);
  }
  console.log(`[email] enviado para ${to} (id: ${data?.id ?? "?"})`);
  return data;
}
