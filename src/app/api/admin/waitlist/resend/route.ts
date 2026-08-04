import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resendWaitlistConfirmations } from "@/lib/waitlistEmail";

// Permite envios em série demorados sem cortar a meio.
export const maxDuration = 300;

/**
 * Reenvia o email de confirmação da lista de espera (só admin). Por omissão só
 * envia a quem ainda não recebeu; com { force: true } reenvia a toda a gente.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const force = Boolean(body?.force);

  const result = await resendWaitlistConfirmations({ force });
  return NextResponse.json({ ok: true, ...result });
}
