import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const roleSchema = z.object({ role: z.enum(["MODERATOR", "ALUNO"]) });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (
    !target ||
    target.role === "ADMIN" ||
    target.role === "PROFESSOR" ||
    target.role === "MUSICO_PROFISSIONAL"
  ) {
    return NextResponse.json({ error: "Não é possível alterar este utilizador" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, role: true },
  });

  return NextResponse.json({ user });
}
