import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  tagIds: z.array(z.string()).min(1).max(20),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  await prisma.tagFollow.createMany({
    data: parsed.data.tagIds.map((tagId) => ({ userId: session.user.id, tagId })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true });
}
