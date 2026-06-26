import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const verifySchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().max(300).optional(),
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
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      verificationStatus: parsed.data.status,
      rejectionReason:
        parsed.data.status === "REJECTED" ? parsed.data.rejectionReason : null,
      verifiedAt: new Date(),
      verifiedById: session!.user.id,
    },
    select: { id: true, name: true, verificationStatus: true },
  });

  return NextResponse.json({ user });
}
