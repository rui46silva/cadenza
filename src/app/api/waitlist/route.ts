import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/emailLayout";

const MIN_SUBMIT_MS = 1500;

const waitlistSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(80).optional(),
  instrument: z.string().trim().min(1).max(50).optional(),
  website: z.string().optional(),
  renderedAt: z.number().optional(),
});

export async function GET() {
  const count = await prisma.waitlistSignup.count();
  return NextResponse.json({ count });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = waitlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const { email, name, instrument, website, renderedAt } = parsed.data;

  const isBot =
    Boolean(website) || (renderedAt !== undefined && Date.now() - renderedAt < MIN_SUBMIT_MS);
  if (isBot) {
    const count = await prisma.waitlistSignup.count();
    return NextResponse.json({ ok: true, count }, { status: 201 });
  }

  const ip = getClientIp(req);
  if (isRateLimited(`waitlist:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados pedidos. Tenta mais tarde." }, { status: 429 });
  }

  // Já inscrito? Avisamos com uma mensagem amigável, sem criar duplicados.
  const existing = await prisma.waitlistSignup.findUnique({ where: { email } });
  if (existing) {
    const count = await prisma.waitlistSignup.count();
    return NextResponse.json({ ok: true, alreadySignedUp: true, count });
  }

  let created = false;
  try {
    await prisma.waitlistSignup.create({ data: { email, name, instrument } });
    created = true;
  } catch {
    // Corrida rara: alguém inscreveu-se em simultâneo — tratamos como já inscrito.
    const count = await prisma.waitlistSignup.count();
    return NextResponse.json({ ok: true, alreadySignedUp: true, count });
  }

  if (created) {
    const firstName = name?.split(" ")[0];
    await sendEmail({
      to: email,
      subject: "Estás na lista de espera da Cadenza 🎶",
      html: renderEmail({
        heading: firstName ? `Obrigado, ${firstName}!` : "Estás na lista! 🎉",
        intro:
          "Guardámos o teu lugar na lista de espera da Cadenza. Vais ser das primeiras pessoas a entrar no fórum quando o acesso antecipado abrir.",
        bodyHtml: instrument
          ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Também te avisamos quando houver uma masterclass de <strong>${instrument}</strong>.</p>`
          : undefined,
        footnote: "Enquanto esperas, segue-nos nas redes sociais para não perderes novidades.",
      }),
    }).catch((err) => console.error("waitlist email failed", err));
  }

  const count = await prisma.waitlistSignup.count();
  return NextResponse.json({ ok: true, count }, { status: 201 });
}
