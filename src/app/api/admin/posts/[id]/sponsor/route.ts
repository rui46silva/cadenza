import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  sponsored: z.boolean(),
  sponsorName: z.string().max(80).optional().or(z.literal("")),
  sponsorUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { sponsored, sponsorName, sponsorUrl } = parsed.data;

  const post = await prisma.post.update({
    where: { id },
    data: {
      sponsored,
      sponsorName: sponsored ? sponsorName || null : null,
      sponsorUrl: sponsored ? sponsorUrl || null : null,
    },
    select: { id: true, sponsored: true, sponsorName: true, sponsorUrl: true },
  });

  return NextResponse.json({ post });
}
