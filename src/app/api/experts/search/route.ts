import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { expertWhere } from "@/lib/experts";

/**
 * Sugere especialistas (professores/profissionais verificados e embaixadores)
 * para dirigir uma dúvida. Filtra por nome (`q`) e dá prioridade a quem toca o
 * instrumento indicado (`instrument`), depois por pontos.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const instrument = searchParams.get("instrument")?.trim() ?? "";

  const experts = await prisma.user.findMany({
    where: {
      AND: [
        expertWhere,
        { id: { not: session.user.id } },
        q ? { name: { contains: q, mode: "insensitive" } } : {},
      ],
    },
    select: {
      id: true,
      name: true,
      role: true,
      instrument: true,
      gender: true,
      avatarUrl: true,
      verificationStatus: true,
      isAmbassador: true,
      points: true,
    },
    take: 30,
  });

  const wanted = instrument.toLowerCase();
  const ranked = experts
    .map((e) => ({
      ...e,
      matchesInstrument: Boolean(wanted) && e.instrument?.toLowerCase() === wanted,
    }))
    .sort((a, b) => {
      if (a.matchesInstrument !== b.matchesInstrument) {
        return a.matchesInstrument ? -1 : 1;
      }
      return b.points - a.points;
    })
    .slice(0, 8);

  return NextResponse.json({ experts: ranked });
}
