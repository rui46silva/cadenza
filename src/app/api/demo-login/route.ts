import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoSeed } from "@/lib/demoSeed";

export async function POST() {
  try {
    await ensureDemoSeed(prisma);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("demo-login seed failed", err);
    return NextResponse.json(
      { error: "Não foi possível preparar a conta demo." },
      { status: 500 }
    );
  }
}
