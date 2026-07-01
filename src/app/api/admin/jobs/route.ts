import { NextResponse } from "next/server";
import { z } from "zod";
import type { JobType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { JOB_TYPE_ORDER } from "@/lib/jobTypes";

const schema = z.object({
  title: z.string().min(2).max(200),
  organization: z.string().min(2).max(200),
  location: z.string().max(120).optional().or(z.literal("")),
  type: z.enum(JOB_TYPE_ORDER as [string, ...string[]]),
  instrument: z.string().max(60).optional().or(z.literal("")),
  description: z.string().min(2).max(3000),
  applyUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
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

  const {
    title,
    organization,
    location,
    type,
    instrument,
    description,
    applyUrl,
    contactEmail,
    expiresAt,
    featured,
  } = parsed.data;

  const job = await prisma.jobListing.create({
    data: {
      title,
      organization,
      location: location || null,
      type: type as JobType,
      instrument: instrument || null,
      description,
      applyUrl: applyUrl || null,
      contactEmail: contactEmail || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      featured: featured ?? false,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
