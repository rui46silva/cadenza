import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Apaga toda a lista de espera (só admin). Útil para testes antes do lançamento. */
export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { count } = await prisma.waitlistSignup.deleteMany({});
  return NextResponse.json({ ok: true, deleted: count });
}
