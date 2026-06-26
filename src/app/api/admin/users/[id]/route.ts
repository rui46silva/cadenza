import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Não te podes eliminar a ti mesmo" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
  }
  if (target.role === "ADMIN" || target.role === "MODERATOR") {
    return NextResponse.json(
      { error: "Não é possível eliminar administradores ou moderadores" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    const userComments = await tx.comment.findMany({
      where: { authorId: id },
      select: { id: true },
    });
    const commentIds = userComments.map((c) => c.id);
    if (commentIds.length > 0) {
      await tx.comment.updateMany({
        where: { parentId: { in: commentIds } },
        data: { parentId: null },
      });
    }
    await tx.comment.deleteMany({ where: { authorId: id } });
    await tx.post.deleteMany({ where: { authorId: id } });
    await tx.user.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
