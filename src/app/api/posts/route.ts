import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardPoints, POINTS } from "@/lib/points";
import { COMMON_INSTRUMENTS } from "@/lib/instruments";
import { expertWhere } from "@/lib/experts";

const INSTRUMENT_NAMES = new Set(COMMON_INSTRUMENTS.map((i) => i.toLowerCase()));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");

  const posts = await prisma.post.findMany({
    where: tag ? { tags: { some: { tag: { name: tag } } } } : undefined,
    include: {
      author: { select: { id: true, name: true, role: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
}

const postSchema = z.object({
  title: z.string().min(3).max(150),
  type: z.enum(["TEXT", "VIDEO"]),
  content: z.string().max(10000).optional(),
  videoUrl: z.string().url().optional(),
  tagNames: z.array(z.string()).max(8).default([]),
  isQuestion: z.boolean().default(false),
  directedToId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, type, content, videoUrl, tagNames, isQuestion, directedToId } = parsed.data;

  // Uma dúvida só pode ser dirigida a um especialista (professor/profissional
  // verificado ou embaixador).
  let directedTo: { id: string } | null = null;
  if (isQuestion && directedToId) {
    directedTo = await prisma.user.findFirst({
      where: { AND: [{ id: directedToId }, expertWhere] },
      select: { id: true },
    });
    if (!directedTo) {
      return NextResponse.json(
        { error: "Destinatário não encontrado ou não verificado" },
        { status: 400 }
      );
    }
  }

  if (type === "VIDEO" && !videoUrl) {
    return NextResponse.json(
      { error: "videoUrl é obrigatório para posts de vídeo" },
      { status: 400 }
    );
  }
  if (type === "TEXT" && !content) {
    return NextResponse.json(
      { error: "content é obrigatório para posts de texto" },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      title,
      type,
      content,
      videoUrl,
      isQuestion,
      directedToId: directedTo?.id,
      authorId: session.user.id,
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const category = INSTRUMENT_NAMES.has(name.toLowerCase())
              ? "INSTRUMENT"
              : "OTHER";
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name, category },
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  await awardPoints(session.user.id, POINTS.POST_CREATED);

  if (isQuestion) {
    // Notifica o especialista a quem a dúvida foi dirigida e os especialistas
    // cujo instrumento corresponde às tags da pergunta, para a verem na fila.
    const tagNamesLower = tagNames.map((n) => n.toLowerCase());
    const experts = await prisma.user.findMany({
      where: { AND: [expertWhere, { id: { not: session.user.id } }] },
      select: { id: true, instrument: true },
    });
    const notifyIds = new Set<string>();
    if (directedTo) notifyIds.add(directedTo.id);
    for (const pro of experts) {
      const instrument = pro.instrument?.trim().toLowerCase();
      if (instrument && tagNamesLower.includes(instrument)) notifyIds.add(pro.id);
    }
    if (notifyIds.size > 0) {
      await prisma.notification.createMany({
        data: [...notifyIds].map((userId) => ({
          type: "QUESTION" as const,
          userId,
          fromUserId: session.user.id,
          postId: post.id,
        })),
      });
    }
  }

  return NextResponse.json({ post }, { status: 201 });
}
