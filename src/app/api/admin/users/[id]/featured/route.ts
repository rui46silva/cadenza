import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  // Dias de destaque a conceder; 0 remove o destaque.
  days: z.number().int().min(0).max(365),
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

  const featuredUntil = parsed.data.days > 0
    ? new Date(Date.now() + parsed.data.days * 24 * 60 * 60 * 1000)
    : null;

  const user = await prisma.user.update({
    where: { id },
    data: { featuredUntil },
    select: { id: true, name: true, featuredUntil: true },
  });

  return NextResponse.json({ user });
}
