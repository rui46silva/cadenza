import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  path: z.string().min(1).max(200),
  title: z.string().max(200).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { path, title, metaDescription } = parsed.data;

  const meta = await prisma.pageMeta.upsert({
    where: { path },
    create: { path, title: title || null, metaDescription: metaDescription || null },
    update: { title: title || null, metaDescription: metaDescription || null },
  });

  return NextResponse.json({ meta });
}
