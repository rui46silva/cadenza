import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaff, INFRACTION_SUGGESTED_DAYS } from "@/lib/moderation";

const banSchema = z.object({
  infraction: z.enum([
    "SPAM",
    "DISCURSO_ODIO",
    "ASSEDIO",
    "DIREITOS_AUTOR",
    "CONTEUDO_INAPROPRIADO",
    "OUTRO",
  ]),
  reason: z.string().max(300).optional(),
  permanent: z.boolean().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isStaff(session?.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session!.user.id) {
    return NextResponse.json({ error: "Não te podes banir a ti mesmo" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
  }
  if (isStaff(target.role)) {
    return NextResponse.json(
      { error: "Não é possível banir administradores ou moderadores" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = banSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { infraction, reason, permanent } = parsed.data;
  const suggestedDays = INFRACTION_SUGGESTED_DAYS[infraction];
  const expiresAt =
    permanent || suggestedDays === null
      ? null
      : new Date(Date.now() + suggestedDays * 24 * 60 * 60 * 1000);

  const ban = await prisma.ban.create({
    data: {
      userId: id,
      infraction,
      reason,
      bannedById: session!.user.id,
      expiresAt: permanent ? null : expiresAt,
    },
  });

  return NextResponse.json({ ban });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isStaff(session?.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.ban.updateMany({
    where: { userId: id, liftedAt: null },
    data: { liftedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
