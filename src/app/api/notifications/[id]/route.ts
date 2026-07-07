import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function ownedNotification(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  return notification && notification.userId === userId;
}

/** Marca uma notificação como lida. */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await ownedNotification(id, session.user.id))) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }

  await prisma.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}

/** Elimina uma notificação. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await ownedNotification(id, session.user.id))) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }

  await prisma.notification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
