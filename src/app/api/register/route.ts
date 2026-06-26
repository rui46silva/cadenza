import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requiresVerification } from "@/lib/moderation";
import { createAndSendVerificationEmail } from "@/lib/emailVerification";

const registerSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(["PROFESSOR", "MUSICO_PROFISSIONAL", "ALUNO"]).default("ALUNO"),
    instrument: z.string().max(60).optional(),
    verificationNote: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      !requiresVerification(data.role) ||
      (data.verificationNote && data.verificationNote.trim().length >= 30),
    {
      message:
        "Descreve as tuas credenciais (mín. 30 caracteres)",
      path: ["verificationNote"],
    }
  );

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, role, instrument, verificationNote } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este email" },
      { status: 409 }
    );
  }

  const waitlistSignup = await prisma.waitlistSignup.findUnique({ where: { email } });

  const launchDate = process.env.NEXT_PUBLIC_LAUNCH_DATE;
  const isBeforeLaunch = launchDate && Date.now() < new Date(launchDate).getTime();
  if (isBeforeLaunch && !waitlistSignup) {
    return NextResponse.json(
      {
        error:
          "Ainda não chegou a tua vez. Entra na lista de espera para garantires acesso antecipado.",
      },
      { status: 403 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      instrument: instrument || waitlistSignup?.instrument || undefined,
      verificationStatus: requiresVerification(role) ? "PENDING" : "APPROVED",
      verificationNote: requiresVerification(role) ? verificationNote : undefined,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await createAndSendVerificationEmail(user);

  return NextResponse.json({ user }, { status: 201 });
}
