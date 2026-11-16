"use client";

import { useMemo } from "react";
import {
  analyzeSeo,
  seoScore,
  lengthStatus,
  TITLE_MIN,
  TITLE_MAX,
  DESC_MIN,
  DESC_MAX,
  type SeoCheckStatus,
} from "@/lib/seoAnalysis";

const STATUS_DOT: Record<SeoCheckStatus, string> = {
  good: "bg-emerald-500",
  ok: "bg-amber-500",
  bad: "bg-rose-500",
};

function Meter({ len, min, max }: { len: number; min: number; max: number }) {
  const status = lengthStatus(len, min, max);
  const pct = Math.min(100, (len / max) * 100);
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-1 flex-1 rounded-full bg-black/10 dark:bg-white/10">
        <div
          className={`h-1 rounded-full transition-all ${
            status === "good" ? "bg-emerald-500" : status === "ok" ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-black/40 dark:text-white/40">
        {len}/{max}
      </span>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm";

export default function SeoEditor({
  title,
  onTitleChange,
  metaDescription,
  onMetaChange,
  focusKeyword,
  onFocusKeywordChange,
  slug,
  content,
  displayUrl,
  titlePlaceholder,
  descPlaceholder,
  editTitle = true,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaChange: (v: string) => void;
  focusKeyword: string;
  onFocusKeywordChange: (v: string) => void;
  slug?: string;
  content?: string;
  displayUrl: string;
  titlePlaceholder?: string;
  descPlaceholder?: string;
  // Quando false, o título é só contexto (editado noutro sítio) e não mostra input.
  editTitle?: boolean;
}) {
  const checks = useMemo(
    () => analyzeSeo({ title, metaDescription, slug, content, focusKeyword }),
    [title, metaDescription, slug, content, focusKeyword]
  );
  const score = seoScore(checks);
  const scoreColor = score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-rose-500";

  const previewTitle = title.trim() || titlePlaceholder || "Título da página";
  const previewDesc = metaDescription.trim() || descPlaceholder || "A meta-descrição aparece aqui…";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Análise SEO</h3>
        <span className={`text-sm font-bold ${scoreColor}`}>{score}/100</span>
      </div>

      {/* Pré-visualização do resultado no Google */}
      <div className="rounded-md border border-black/10 dark:border-white/10 bg-white p-3 dark:bg-neutral-900">
        <p className="text-xs text-emerald-700 dark:text-emerald-500">{displayUrl}</p>
        <p className="truncate text-[17px] leading-tight text-[#1a0dab] dark:text-[#8ab4f8]">
          {previewTitle}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-black/70 dark:text-white/60">
          {previewDesc}
        </p>
      </div>

      {/* Palavra-chave de foco */}
      <label className="text-xs text-black/50 dark:text-white/50">
        Palavra-chave de foco
        <input
          value={focusKeyword}
          onChange={(e) => onFocusKeywordChange(e.target.value)}
          placeholder="ex: aulas de piano"
          className={`${inputClass} mt-1`}
        />
      </label>

      {/* Título SEO */}
      {editTitle && (
        <label className="text-xs text-black/50 dark:text-white/50">
          Título SEO
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={titlePlaceholder}
            className={`${inputClass} mt-1`}
          />
          <Meter len={title.trim().length} min={TITLE_MIN} max={TITLE_MAX} />
        </label>
      )}

      {/* Meta-descrição */}
      <label className="text-xs text-black/50 dark:text-white/50">
        Meta-descrição
        <textarea
          value={metaDescription}
          onChange={(e) => onMetaChange(e.target.value)}
          placeholder={descPlaceholder}
          rows={3}
          className={`${inputClass} mt-1`}
        />
        <Meter len={metaDescription.trim().length} min={DESC_MIN} max={DESC_MAX} />
      </label>

      {/* Checklist */}
      <ul className="flex flex-col gap-1.5">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-xs">
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[c.status]}`} />
            <span className="text-black/70 dark:text-white/70">{c.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
