import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const reportSchema = z.object({
  reason: z.enum([
    "SPAM",
    "DISCURSO_ODIO",
    "ASSEDIO",
    "DIREITOS_AUTOR",
    "CONTEUDO_INAPROPRIADO",
    "OUTRO",
  ]),
  details: z.string().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  }
  if (post.authorId === session.user.id) {
    return NextResponse.json({ error: "Não podes denunciar o teu próprio post" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const existing = await prisma.report.findUnique({
    where: { postId_reporterId: { postId: id, reporterId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Já denunciaste este post" }, { status: 400 });
  }

  const { reason, details } = parsed.data;
  const report = await prisma.report.create({
    data: { postId: id, reporterId: session.user.id, reason, details },
  });

  return NextResponse.json({ report });
}
