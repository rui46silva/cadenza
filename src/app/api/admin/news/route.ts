import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2).max(200),
  summary: z.string().min(2).max(500),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  source: z.string().max(80).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, summary, url, imageUrl, source } = parsed.data;

  const article = await prisma.newsArticle.create({
    data: {
      title,
      summary,
      url: url || null,
      imageUrl: imageUrl || null,
      source: source || null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}
