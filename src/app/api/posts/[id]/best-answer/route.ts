import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/moderation";

const bodySchema = z.object({ commentId: z.string() });

async function canManage(postAuthorId: string, userId: string, role?: string) {
  return postAuthorId === userId || isStaff(role);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  }
  if (!(await canManage(post.authorId, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: parsed.data.commentId } });
  if (!comment || comment.postId !== id || comment.isDeleted) {
    return NextResponse.json({ error: "Comentário inválido" }, { status: 400 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { bestAnswerId: comment.id },
    select: { id: true, bestAnswerId: true },
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  }
  if (!(await canManage(post.authorId, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { bestAnswerId: null },
    select: { id: true, bestAnswerId: true },
  });

  return NextResponse.json({ post: updated });
}
