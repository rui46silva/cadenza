import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/moderation";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isStaff(session?.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.waitlistSignup.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
