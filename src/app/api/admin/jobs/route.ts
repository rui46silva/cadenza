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
  title: z.string().min(2).max(200),
  slug: z.string().max(80).optional().or(z.literal("")),
  organization: z.string().min(2).max(200),
  location: z.string().max(120).optional().or(z.literal("")),
  type: z.enum(JOB_TYPE_ORDER as [string, ...string[]]),
  instrument: z.string().max(60).optional().or(z.literal("")),
  description: z.string().min(2).max(3000),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  focusKeyword: z.string().max(80).optional().or(z.literal("")),
  applyUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await apiSessionFor(canEditContent);
  if (!session) {
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
    slug,
    organization,
    location,
    type,
    instrument,
    description,
    metaDescription,
    focusKeyword,
    applyUrl,
    contactEmail,
    expiresAt,
    featured,
  } = parsed.data;

  const job = await prisma.jobListing.create({
    data: {
      title,
      slug: await uniqueJobSlug(slug || title),
      organization,
      location: location || null,
      type: type as JobType,
      instrument: instrument || null,
      description,
      metaDescription: metaDescription || null,
      focusKeyword: focusKeyword || null,
      applyUrl: applyUrl || null,
      contactEmail: contactEmail || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      featured: featured ?? false,
      createdById: session.user.id,
    },
  });

  await saveRevision("job", job.id, jobSnapshot(job), session);
  await logActivity(session, "create", "job", job.id, `Criou a vaga "${job.title}"`);

  return NextResponse.json({ job }, { status: 201 });
}
