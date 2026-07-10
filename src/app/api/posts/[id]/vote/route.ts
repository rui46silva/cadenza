import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardPoints, pointsForVoteValue } from "@/lib/points";

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

  const previousVote = await prisma.postVote.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  const isUnvote = previousVote?.value === parsed.data.value;

  if (isUnvote) {
    await prisma.postVote.delete({
      where: { postId_userId: { postId, userId: session.user.id } },
    });
  } else {
    await prisma.postVote.upsert({
      where: { postId_userId: { postId, userId: session.user.id } },
      update: { value: parsed.data.value },
      create: { postId, userId: session.user.id, value: parsed.data.value },
    });
  }

  // Atualiza o score desnormalizado por incremento (contribuição nova - antiga),
  // evitando recarregar todos os votos do post.
  const contribution = (v: "UP" | "DOWN" | null | undefined) =>
    v === "UP" ? 1 : v === "DOWN" ? -1 : 0;
  const scoreDelta =
    contribution(isUnvote ? null : parsed.data.value) - contribution(previousVote?.value);

  const post = await prisma.post.update({
    where: { id: postId },
    data: { score: { increment: scoreDelta } },
    select: { authorId: true, score: true },
  });

  if (post.authorId !== session.user.id) {
    const delta =
      pointsForVoteValue(isUnvote ? null : parsed.data.value) -
      pointsForVoteValue(previousVote?.value ?? null);
    await awardPoints(post.authorId, delta);
  }

  return NextResponse.json({ score: post.score, userVote: isUnvote ? null : parsed.data.value });
}
