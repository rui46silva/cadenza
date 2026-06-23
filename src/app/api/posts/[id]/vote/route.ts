import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const voteSchema = z.object({ value: z.enum(["UP", "DOWN"]) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Voto inválido" }, { status: 400 });
  }

  const vote = await prisma.postVote.upsert({
    where: { postId_userId: { postId, userId: session.user.id } },
    update: { value: parsed.data.value },
    create: { postId, userId: session.user.id, value: parsed.data.value },
  });

  return NextResponse.json({ vote });
}
