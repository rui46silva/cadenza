import { NextResponse } from "next/server";
import { z } from "zod";
import { createAndSendPasswordReset } from "@/lib/passwordReset";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  // Resposta genérica mesmo com input inválido, para não dar pistas.
  if (!parsed.success) return NextResponse.json({ ok: true });

  const ip = getClientIp(req);
  if (isRateLimited(`forgot:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados pedidos. Tenta mais tarde." }, { status: 429 });
  }

  await createAndSendPasswordReset(parsed.data.email).catch((err) =>
    console.error("password reset email failed", err)
  );

  // Sempre ok — não revela se o email existe.
  return NextResponse.json({ ok: true });
}
