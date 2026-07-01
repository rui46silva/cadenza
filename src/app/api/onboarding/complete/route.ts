import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
