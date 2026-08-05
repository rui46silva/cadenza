import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoSeed } from "@/lib/demoSeed";
import { isDemoHost } from "@/lib/demoHost";

export async function POST(req: Request) {
  // Só o ambiente de demo pode semear dados de exemplo. Em produção este
  // endpoint não faz nada, para nunca repor conteúdo de exemplo nem poluir a
  // base de dados real (ex: inscrições fictícias na lista de espera).
  if (!isDemoHost(req.headers.get("host"))) {
    return NextResponse.json({ error: "Indisponível." }, { status: 404 });
  }

  try {
    await ensureDemoSeed(prisma);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("demo-login seed failed", err);
    return NextResponse.json(
      { error: "Não foi possível preparar a conta demo." },
      { status: 500 }
    );
  }
}
