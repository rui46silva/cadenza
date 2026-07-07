import { NextResponse } from "next/server";
import { escalateStaleQuestions } from "@/lib/escalateQuestions";

export const dynamic = "force-dynamic";

/**
 * Tarefa agendada (Vercel Cron, ver vercel.json): abre à comunidade as dúvidas
 * dirigidas sem resposta ao fim de 3 dias. Protegida por CRON_SECRET quando
 * definido — o Vercel envia-o no cabeçalho Authorization.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    const result = await escalateStaleQuestions();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("escalate-questions failed", err);
    return NextResponse.json({ error: "Falha ao escalar dúvidas" }, { status: 500 });
  }
}
