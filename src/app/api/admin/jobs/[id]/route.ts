import { NextResponse } from "next/server";
import { z } from "zod";
import type { JobType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { JOB_TYPE_ORDER } from "@/lib/jobTypes";
import { uniqueJobSlug } from "@/lib/jobSlug";

const schema = z.object({
  featured: z.boolean().optional(),
  title: z.string().min(2).max(200).optional(),
  slug: z.string().max(80).optional().or(z.literal("")),
  organization: z.string().min(2).max(200).optional(),
  location: z.string().max(120).optional().or(z.literal("")),
  type: z.enum(JOB_TYPE_ORDER as [string, ...string[]]).optional(),
  instrument: z.string().max(60).optional().or(z.literal("")),
  description: z.string().min(2).max(3000).optional(),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  focusKeyword: z.string().max(80).optional().or(z.literal("")),
  applyUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
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

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.featured !== undefined) data.featured = d.featured;
  if (d.title !== undefined) data.title = d.title;
  if (d.organization !== undefined) data.organization = d.organization;
  if (d.location !== undefined) data.location = d.location || null;
  if (d.type !== undefined) data.type = d.type as JobType;
  if (d.instrument !== undefined) data.instrument = d.instrument || null;
  if (d.description !== undefined) data.description = d.description;
  if (d.metaDescription !== undefined) data.metaDescription = d.metaDescription || null;
  if (d.focusKeyword !== undefined) data.focusKeyword = d.focusKeyword || null;
  if (d.applyUrl !== undefined) data.applyUrl = d.applyUrl || null;
  if (d.contactEmail !== undefined) data.contactEmail = d.contactEmail || null;
  if (d.expiresAt !== undefined) data.expiresAt = d.expiresAt ? new Date(d.expiresAt) : null;
  if (d.slug !== undefined) data.slug = await uniqueJobSlug(d.slug || d.title || "vaga", id);

  const job = await prisma.jobListing.update({ where: { id }, data });

  return NextResponse.json({ job });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.jobListing.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
