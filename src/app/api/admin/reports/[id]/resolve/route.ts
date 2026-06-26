import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaff, INFRACTION_SUGGESTED_DAYS } from "@/lib/moderation";
import { sendModerationEmail } from "@/lib/moderationEmail";

const resolveSchema = z.object({
  action: z.enum(["DELETE_POST", "BAN_AUTHOR", "DISMISS"]),
  message: z.string().max(1000).optional(),
  permanent: z.boolean().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isStaff(session?.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { post: { include: { author: true } } },
  });
  if (!report) {
    return NextResponse.json({ error: "Denúncia não encontrada" }, { status: 404 });
  }
  if (report.status !== "PENDING") {
    return NextResponse.json({ error: "Denúncia já foi resolvida" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { action, message, permanent } = parsed.data;
  const author = report.post.author;

  if (action === "DISMISS") {
    await prisma.report.update({
      where: { id },
      data: { status: "DISMISSED", resolvedAt: new Date(), resolvedById: session!.user.id },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "DELETE_POST") {
    if (message) {
      await sendModerationEmail(
        author.email,
        author.name,
        "O teu post foi removido — Cadenza",
        message
      );
    }
    // Apaga o post; cascade remove esta e outras denúncias associadas.
    await prisma.post.delete({ where: { id: report.postId } });
    return NextResponse.json({ ok: true });
  }

  // BAN_AUTHOR
  if (isStaff(author.role)) {
    return NextResponse.json(
      { error: "Não é possível banir administradores ou moderadores" },
      { status: 400 }
    );
  }
  const suggestedDays = INFRACTION_SUGGESTED_DAYS[report.reason];
  const expiresAt =
    permanent || suggestedDays === null
      ? null
      : new Date(Date.now() + suggestedDays * 24 * 60 * 60 * 1000);

  await prisma.ban.create({
    data: {
      userId: author.id,
      infraction: report.reason,
      reason: report.details ?? undefined,
      bannedById: session!.user.id,
      expiresAt,
    },
  });

  if (message) {
    await sendModerationEmail(
      author.email,
      author.name,
      "A tua conta foi suspensa — Cadenza",
      message
    );
  }

  await prisma.report.updateMany({
    where: { postId: report.postId, status: "PENDING" },
    data: { status: "AUTHOR_BANNED", resolvedAt: new Date(), resolvedById: session!.user.id },
  });

  return NextResponse.json({ ok: true });
}
