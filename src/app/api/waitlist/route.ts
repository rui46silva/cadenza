import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const waitlistSchema = z.object({
  email: z.string().email(),
  instrument: z.string().trim().min(1).max(50).optional(),
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

  const { email, instrument } = parsed.data;

  try {
    await prisma.waitlistSignup.create({ data: { email, instrument } });
  } catch {
    // Email já está na lista — tratamos como sucesso para não revelar quem já se inscreveu.
  }

  const count = await prisma.waitlistSignup.count();
  return NextResponse.json({ ok: true, count }, { status: 201 });
}
