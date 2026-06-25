import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(["PROFESSOR", "ALUNO"]).default("ALUNO"),
    instrument: z.string().max(60).optional(),
    verificationNote: z.string().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.role !== "PROFESSOR" ||
      (data.verificationNote && data.verificationNote.trim().length >= 30),
    {
      message:
        "Descreve as tuas credenciais de professor (mín. 30 caracteres)",
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

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      instrument,
      verificationStatus: role === "PROFESSOR" ? "PENDING" : "APPROVED",
      verificationNote: role === "PROFESSOR" ? verificationNote : undefined,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
