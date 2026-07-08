import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { inviteWaitlistSignup } from "@/lib/earlyAccess";

const schema = z.object({ id: z.string().optional() });

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { id } = schema.parse(body ?? {});

  const signups = await prisma.waitlistSignup.findMany({
    where: id ? { id } : { invitedAt: null },
    select: { id: true, email: true, name: true, inviteToken: true },
  });

  let invited = 0;
  for (const signup of signups) {
    try {
      await inviteWaitlistSignup(signup);
      invited += 1;
    } catch (err) {
      console.error("invite failed", signup.email, err);
    }
  }

  return NextResponse.json({ ok: true, invited });
}
