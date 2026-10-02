import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id: postId } = await params;

  await prisma.bookmark.upsert({
    where: { userId_postId: { userId: session.user.id, postId } },
    update: {},
    create: { userId: session.user.id, postId },
  });

  return NextResponse.json({ bookmarked: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id: postId } = await params;

  await prisma.bookmark
    .delete({ where: { userId_postId: { userId: session.user.id, postId } } })
    .catch(() => null);

  return NextResponse.json({ bookmarked: false });
}
