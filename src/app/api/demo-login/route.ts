import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoSeed } from "@/lib/demoSeed";

export async function POST() {
  await ensureDemoSeed(prisma);
  return NextResponse.json({ ok: true });
}
