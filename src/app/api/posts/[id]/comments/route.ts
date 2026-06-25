import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const commentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

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
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  }

  const parentComment = parsed.data.parentId
    ? await prisma.comment.findUnique({ where: { id: parsed.data.parentId } })
    : null;

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      parentId: parsed.data.parentId,
      postId,
      authorId: session.user.id,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  });

  const notifyUserId = parentComment ? parentComment.authorId : post.authorId;
  if (notifyUserId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: parentComment ? "REPLY" : "COMMENT",
        userId: notifyUserId,
        fromUserId: session.user.id,
        postId,
        commentId: comment.id,
      },
    });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
