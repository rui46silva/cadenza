import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

const MIN_SUBMIT_MS = 1500;

const waitlistSchema = z.object({
  email: z.string().email(),
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

  const { email, instrument, website, renderedAt } = parsed.data;

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

  try {
    await prisma.waitlistSignup.create({ data: { email, instrument } });
  } catch {
    // Email já está na lista — tratamos como sucesso para não revelar quem já se inscreveu.
  }

  const count = await prisma.waitlistSignup.count();
  return NextResponse.json({ ok: true, count }, { status: 201 });
}
