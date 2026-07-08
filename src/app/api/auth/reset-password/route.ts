import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/passwordReset";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A palavra-passe tem de ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const ok = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!ok) {
    return NextResponse.json(
      { error: "Este link é inválido ou expirou. Pede um novo." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
