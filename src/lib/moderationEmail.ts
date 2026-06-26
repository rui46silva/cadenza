import { sendEmail } from "@/lib/email";

export async function sendModerationEmail(
  to: string,
  name: string,
  subject: string,
  message: string
) {
  await sendEmail({
    to,
    subject,
    html: `
      <p>Olá ${name},</p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  });
}
