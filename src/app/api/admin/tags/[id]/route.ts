import { NextResponse } from "next/server";
import { z } from "zod";
import type { TagCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/moderation";
import { CATEGORY_ORDER } from "@/lib/tagCategories";

const schema = z.object({ category: z.enum(CATEGORY_ORDER as [string, ...string[]]) });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isStaff(session?.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: { category: parsed.data.category as TagCategory },
  });

  return NextResponse.json({ tag });
}
