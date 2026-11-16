"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { JobType } from "@prisma/client";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import RichEditor from "@/components/admin/RichEditor";
import SeoEditor from "@/components/admin/SeoEditor";
import { Panel, PublishPanel, RevisionsPanel } from "@/components/admin/EditorPanels";
import { useAutosave } from "@/components/admin/useAutosave";
import { JOB_TYPE_LABELS, JOB_TYPE_ORDER } from "@/lib/jobTypes";
import { markdownToText } from "@/lib/markdown";

export type JobEditorJob = {
  id: string;
  title: string;
  slug: string | null;
  organization: string;
  location: string | null;
  type: JobType;
  instrument: string | null;
  description: string;
  metaDescription: string | null;
  focusKeyword: string | null;
  applyUrl: string | null;
  contactEmail: string | null;
  featured: boolean;
  expiresAt: string | null;
};

type Form = Omit<JobEditorJob, "id" | "slug" | "location" | "instrument" | "metaDescription" | "focusKeyword" | "applyUrl" | "contactEmail" | "expiresAt"> & {
  slug: string;
  location: string;
  instrument: string;
  metaDescription: string;
  focusKeyword: string;
  applyUrl: string;
  contactEmail: string;
  expiresAt: string;
};

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cadenza.pt").replace(/^https?:\/\//, "");
const input = "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20";

function toForm(j: JobEditorJob | null): Form {
  return {
    title: j?.title ?? "",
    slug: j?.slug ?? "",
    organization: j?.organization ?? "",
    location: j?.location ?? "",
    type: j?.type ?? "ORQUESTRA",
    instrument: j?.instrument ?? "",
    description: j?.description ?? "",
    metaDescription: j?.metaDescription ?? "",
    focusKeyword: j?.focusKeyword ?? "",
    applyUrl: j?.applyUrl ?? "",
    contactEmail: j?.contactEmail ?? "",
    featured: j?.featured ?? false,
    expiresAt: j?.expiresAt ? j.expiresAt.slice(0, 10) : "",
  };
}

export default function JobEditor({ job }: { job: JobEditorJob | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = !job;
  const [form, setForm] = useState<Form>(() => toForm(job));
  const [saved, setSaved] = useState<Form>(() => toForm(job));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [revKey, setRevKey] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  const autosave = useAutosave(`job:${job?.id ?? "new"}`, form, dirty);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(isNew ? "/api/admin/jobs" : `/api/admin/jobs/${job!.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    if (!res.ok) {
      const fieldErrors = data?.details?.fieldErrors as Record<string, string[]> | undefined;
      const first = fieldErrors ? Object.entries(fieldErrors)[0] : null;
      setError(first ? `${first[0]}: ${first[1][0]}` : data?.error ?? "Não foi possível guardar.");
      return;
    }
    const next = { ...form, slug: data.job.slug ?? "" };
    setForm(next);
    setSaved(next);
    setSavedAt(new Date());
    setRevKey((k) => k + 1);
    autosave.clear();
    toast(isNew ? "Vaga publicada" : "Vaga atualizada");
    if (isNew) router.replace(`/admin/conteudo/vagas/${data.job.id}`);
    else router.refresh();
  }

  async function remove() {
    await fetch(`/api/admin/jobs/${job!.id}`, { method: "DELETE" });
    autosave.clear();
    toast("Vaga eliminada");
    router.push("/admin/conteudo/vagas");
  }

  function restore(d: Record<string, unknown>) {
    setForm((f) => ({
      ...f,
      title: String(d.title ?? ""),
      slug: String(d.slug ?? ""),
      organization: String(d.organization ?? ""),
      location: String(d.location ?? ""),
      type: (d.type as JobType) ?? f.type,
      instrument: String(d.instrument ?? ""),
      description: String(d.description ?? ""),
      metaDescription: String(d.metaDescription ?? ""),
      focusKeyword: String(d.focusKeyword ?? ""),
      applyUrl: String(d.applyUrl ?? ""),
      contactEmail: String(d.contactEmail ?? ""),
      featured: Boolean(d.featured),
      expiresAt: d.expiresAt ? String(d.expiresAt).slice(0, 10) : "",
    }));
    toast("Versão restaurada — guarda para aplicar");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        {autosave.recovered && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            <span>Há um rascunho não guardado de {new Date(autosave.recovered.savedAt).toLocaleString("pt-PT")}.</span>
            <span className="flex gap-2">
              <button type="button" className="font-medium text-accent hover:underline" onClick={() => { setForm(autosave.recovered!.value); autosave.dismissRecovered(); }}>Recuperar</button>
              <button type="button" className="text-black/50 hover:underline dark:text-white/50" onClick={autosave.clear}>Descartar</button>
            </span>
          </div>
        )}

        <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Título da vaga" className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-black/25 dark:placeholder:text-white/25" />
        <div className="flex flex-wrap items-center gap-1 text-xs text-black/50 dark:text-white/50">
          <span>Ligação permanente: {SITE_HOST}/vagas/</span>
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="gerado-a-partir-do-titulo" className="min-w-[180px] flex-1 rounded border border-black/10 bg-transparent px-1.5 py-0.5 dark:border-white/15" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">Organização<input value={form.organization} onChange={(e) => set("organization", e.target.value)} className={input} /></label>
          <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">Localização<input value={form.location} onChange={(e) => set("location", e.target.value)} className={input} /></label>
          <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">Tipo
            <select value={form.type} onChange={(e) => set("type", e.target.value as JobType)} className={input}>
              {JOB_TYPE_ORDER.map((t) => <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">Instrumento<input value={form.instrument} onChange={(e) => set("instrument", e.target.value)} className={input} /></label>
        </div>

        <RichEditor value={form.description} onChange={(v) => set("description", v)} rows={12} placeholder="Descreve a vaga: requisitos, condições, como candidatar…" />

        {error && <p className="text-sm text-rose-500">{error}</p>}
      </div>

      <aside className="flex flex-col gap-4">
        <PublishPanel
          supportsDraft={false}
          state="published"
          onSave={() => save()}
          onDelete={() => setConfirmDelete(true)}
          saving={saving}
          dirty={dirty}
          savedAt={savedAt}
          isNew={isNew}
          viewHref={!isNew ? `/vagas/${saved.slug || job!.id}` : null}
          extra={
            <>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                Destacar no topo
              </label>
              <label className="flex flex-col gap-1 text-xs text-black/50 dark:text-white/50">
                Expira em
                <input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={input} />
              </label>
            </>
          }
        />

        <Panel title="Candidatura">
          <input value={form.applyUrl} onChange={(e) => set("applyUrl", e.target.value)} placeholder="URL para candidatura" type="url" className={input} />
          <input value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="Email de contacto" type="email" className={input} />
        </Panel>

        <SeoEditor
          title={`${form.title}${form.organization ? ` · ${form.organization}` : ""}`}
          onTitleChange={() => {}}
          metaDescription={form.metaDescription}
          onMetaChange={(v) => set("metaDescription", v)}
          focusKeyword={form.focusKeyword}
          onFocusKeywordChange={(v) => set("focusKeyword", v)}
          slug={form.slug}
          content={markdownToText(form.description)}
          displayUrl={`${SITE_HOST}/vagas/${form.slug || "titulo-da-vaga"}`}
          editTitle={false}
          descPlaceholder="Meta-descrição SEO (~150 caracteres)"
        />

        {!isNew && <RevisionsPanel entityType="job" entityId={job!.id} refreshKey={revKey} onRestore={restore} />}
      </aside>

      {confirmDelete && (
        <ConfirmDialog title="Eliminar vaga" description="Esta ação não pode ser desfeita." confirmLabel="Eliminar" onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
      )}
    </div>
  );
}
