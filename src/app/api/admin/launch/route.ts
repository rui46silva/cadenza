import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { runLaunchReset } from "@/lib/launchReset";

// O reset pode demorar alguns segundos com muito conteúdo.
export const maxDuration = 60;

const schema = z.object({ confirm: z.string() });

/**
 * Botão de lançamento do acesso antecipado (só admin). Limpa o conteúdo de
 * exemplo mantendo a lista de espera, admins e conteúdo de admins. Exige que se
 * escreva LANÇAR para confirmar.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || parsed.data.confirm.trim().toUpperCase() !== "LANÇAR") {
    return NextResponse.json(
      { error: "Escreve LANÇAR para confirmar." },
      { status: 400 }
    );
  }

  const result = await runLaunchReset(prisma);
  return NextResponse.json({ ok: true, ...result });
}
