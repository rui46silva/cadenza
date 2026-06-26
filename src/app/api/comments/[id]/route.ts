import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/moderation";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
  }

  if (comment.authorId !== session.user.id && !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  await prisma.comment.update({
    where: { id },
    data: { content: "", isDeleted: true },
  });

  return NextResponse.json({ ok: true });
}
