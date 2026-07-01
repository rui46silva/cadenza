"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JobType } from "@prisma/client";
import { buttonPrimarySm } from "@/lib/ui";
import { JOB_TYPE_LABELS, JOB_TYPE_ORDER } from "@/lib/jobTypes";
import ConfirmDialog from "@/components/ConfirmDialog";

export type JobListingData = {
  id: string;
  title: string;
  organization: string;
  location: string | null;
  type: JobType;
  instrument: string | null;
  featured: boolean;
  expiresAt: string | Date | null;
  createdAt: string | Date;
};

export default function JobManager({ jobs }: { jobs: JobListingData[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<JobType>("ORQUESTRA");
  const [instrument, setInstrument] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [featured, setFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar a vaga.");
      return;
    }
    setTitle("");
    setOrganization("");
    setLocation("");
    setInstrument("");
    setDescription("");
    setApplyUrl("");
    setContactEmail("");
    setExpiresAt("");
    setFeatured(false);
    router.refresh();
  }

  async function toggleFeatured(id: string, current: boolean) {
    setPendingId(id);
    await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !current }),
    });
    setPendingId(null);
    router.refresh();
  }

  async function remove(id: string) {
    setPendingId(id);
    await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    setPendingId(null);
    setConfirmDeleteId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-lg">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da vaga"
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Organização"
            required
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Localização (opcional)"
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as JobType)}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
          >
            {JOB_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {JOB_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            placeholder="Instrumento (opcional)"
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          required
          rows={3}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            placeholder="URL para candidatura (opcional)"
            type="url"
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
          />
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Email de contacto (opcional)"
            type="email"
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
          />
        </div>
        <label className="text-xs text-black/50 dark:text-white/50 flex flex-col gap-1">
          Expira em (opcional)
          <input
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            type="date"
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Destacar no topo (equivalente ao futuro &ldquo;impulsionar&rdquo;)
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className={`${buttonPrimarySm} self-start`}>
          {loading ? "A publicar..." : "Publicar vaga"}
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {jobs.length === 0 && (
          <p className="text-black/50 dark:text-white/50">Ainda não há vagas.</p>
        )}
        {jobs.map((j) => (
          <li
            key={j.id}
            className="rounded-lg border border-black/10 dark:border-white/10 p-3 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <p className="font-medium text-sm">
                {j.title}{" "}
                {j.featured && (
                  <span className="text-xs text-accent">★ destaque</span>
                )}
              </p>
              <p className="text-xs text-black/50 dark:text-white/50">
                {j.organization} · {JOB_TYPE_LABELS[j.type]}
                {j.location ? ` · ${j.location}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFeatured(j.id, j.featured)}
                disabled={pendingId === j.id}
                className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {j.featured ? "Remover destaque" : "Destacar"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(j.id)}
                disabled={pendingId === j.id}
                className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-rose-500 hover:text-rose-500 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Eliminar vaga"
          description="Esta ação não pode ser desfeita."
          confirmLabel="Eliminar"
          loading={pendingId === confirmDeleteId}
          onConfirm={() => remove(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
