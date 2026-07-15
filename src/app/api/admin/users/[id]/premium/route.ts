import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  isPremium: z.boolean(),
  // Número de meses de subscrição a conceder (opcional). Ausente = indefinido.
  months: z.number().int().min(1).max(60).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { isPremium, months } = parsed.data;
  const premiumUntil = isPremium && months
    ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
    : null;

  const user = await prisma.user.update({
    where: { id },
    data: { isPremium, premiumUntil },
    select: { id: true, name: true, isPremium: true, premiumUntil: true },
  });

  return NextResponse.json({ user });
}
