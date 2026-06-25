import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(500).optional().or(z.literal("")),
  instrument: z.string().max(60).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  instagramHandle: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, ""))
    .pipe(z.string().max(30).regex(/^[a-zA-Z0-9._]*$/, "Utilizador do Instagram inválido"))
    .optional()
    .or(z.literal("")),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, bio, instrument, avatarUrl, instagramHandle } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio: bio || null,
      instrument: instrument || null,
      avatarUrl: avatarUrl || null,
      instagramHandle: instagramHandle || null,
    },
    select: {
      id: true,
      name: true,
      bio: true,
      instrument: true,
      avatarUrl: true,
      instagramHandle: true,
    },
  });

  return NextResponse.json({ user });
}
