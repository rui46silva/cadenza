import { NextResponse } from "next/server";
import { z } from "zod";
import type { JobType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSessionFor } from "@/lib/adminAuth";
import { canEditContent } from "@/lib/moderation";
import { saveRevision } from "@/lib/revisions";
import { logActivity } from "@/lib/activity";
import { JOB_TYPE_ORDER } from "@/lib/jobTypes";
import { uniqueJobSlug, jobSnapshot } from "@/lib/jobSlug";

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
  const session = await apiSessionFor(canEditContent);
  if (!session) {
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

  const onlyFeatured = Object.keys(data).every((k) => k === "featured");
  if (!onlyFeatured) await saveRevision("job", id, jobSnapshot(job), session);
  await logActivity(
    session,
    onlyFeatured ? (job.featured ? "feature" : "unfeature") : "update",
    "job",
    id,
    onlyFeatured
      ? `${job.featured ? "Destacou a vaga" : "Removeu o destaque da vaga"} "${job.title}"`
      : `Editou a vaga "${job.title}"`
  );

  return NextResponse.json({ job });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await apiSessionFor(canEditContent);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const job = await prisma.jobListing.delete({ where: { id } }).catch(() => null);
  if (job) await logActivity(session, "delete", "job", id, `Eliminou a vaga "${job.title}"`);

  return NextResponse.json({ ok: true });
}
