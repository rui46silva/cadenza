import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: 8,
  });

  return NextResponse.json({
    tags: tags
      .filter((t) => t._count.posts > 0)
      .map((t) => ({ id: t.id, name: t.name, postCount: t._count.posts })),
  });
}
