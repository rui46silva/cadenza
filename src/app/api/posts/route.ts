import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardPoints, POINTS } from "@/lib/points";

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

  const { title, type, content, videoUrl, tagNames } = parsed.data;

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
      authorId: session.user.id,
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  await awardPoints(session.user.id, POINTS.POST_CREATED);

  return NextResponse.json({ post }, { status: 201 });
}
