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

  const { id: tagId } = await params;
  await prisma.tagFollow.upsert({
    where: { userId_tagId: { userId: session.user.id, tagId } },
    create: { userId: session.user.id, tagId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id: tagId } = await params;
  await prisma.tagFollow
    .delete({ where: { userId_tagId: { userId: session.user.id, tagId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
