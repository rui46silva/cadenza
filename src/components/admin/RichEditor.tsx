"use client";

import { useMemo, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImageIcon,
  Minus,
  Code,
} from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import MediaPicker from "@/components/admin/MediaPicker";

type Action = {
  label: string;
  icon: typeof Bold;
  run: (sel: string) => { text: string; select?: [number, number] };
  block?: boolean;
};

const ACTIONS: Action[] = [
  { label: "Negrito", icon: Bold, run: (s) => ({ text: `**${s || "texto"}**`, select: [2, 2 + (s || "texto").length] }) },
  { label: "Itálico", icon: Italic, run: (s) => ({ text: `*${s || "texto"}*`, select: [1, 1 + (s || "texto").length] }) },
  { label: "Título", icon: Heading2, block: true, run: (s) => ({ text: `## ${s || "Título"}` }) },
  { label: "Subtítulo", icon: Heading3, block: true, run: (s) => ({ text: `### ${s || "Subtítulo"}` }) },
  { label: "Lista", icon: List, block: true, run: (s) => ({ text: (s || "item").split("\n").map((l) => `- ${l}`).join("\n") }) },
  { label: "Lista numerada", icon: ListOrdered, block: true, run: (s) => ({ text: (s || "item").split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n") }) },
  { label: "Citação", icon: Quote, block: true, run: (s) => ({ text: (s || "citação").split("\n").map((l) => `> ${l}`).join("\n") }) },
  { label: "Código", icon: Code, run: (s) => ({ text: `\`${s || "código"}\`` }) },
  { label: "Link", icon: Link2, run: (s) => ({ text: `[${s || "texto"}](https://)`, select: [(s || "texto").length + 3, (s || "texto").length + 11] }) },
  { label: "Separador", icon: Minus, block: true, run: () => ({ text: "---" }) },
];

/**
 * Editor de conteúdo rico baseado em Markdown: barra de ferramentas,
 * pré-visualização ao vivo, inserção de imagens da biblioteca e contagem de
 * palavras / tempo de leitura.
 */
export default function RichEditor({
  value,
  onChange,
  placeholder,
  rows = 16,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview" | "split">("write");
  const [picker, setPicker] = useState(false);

  const words = useMemo(() => (value.trim() ? value.trim().split(/\s+/).length : 0), [value]);
  const minutes = Math.max(1, Math.round(words / 200));
  const html = useMemo(() => renderMarkdown(value), [value]);

  function apply(action: Action) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const { text, select } = action.run(selected);
    let before = value.slice(0, start);
    let after = value.slice(end);
    // Blocos começam numa linha própria.
    if (action.block) {
      if (before && !before.endsWith("\n")) before += "\n";
      if (after && !after.startsWith("\n")) after = "\n" + after;
    }
    const next = before + text + after;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const base = before.length;
      if (select) el.setSelectionRange(base + select[0], base + select[1]);
      else el.setSelectionRange(base + text.length, base + text.length);
    });
  }

  function insertImage(url: string, alt: string) {
    const el = ref.current;
    const pos = el?.selectionStart ?? value.length;
    const before = value.slice(0, pos);
    const snippet = `${before && !before.endsWith("\n") ? "\n" : ""}![${alt}](${url})\n`;
    onChange(before + snippet + value.slice(pos));
    setPicker(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b") { e.preventDefault(); apply(ACTIONS[0]); }
    if (key === "i") { e.preventDefault(); apply(ACTIONS[1]); }
    if (key === "k") { e.preventDefault(); apply(ACTIONS[8]); }
  }

  const tab = (m: typeof mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`rounded px-2 py-1 text-xs ${mode === m ? "bg-accent/10 font-medium text-accent" : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"}`}
    >
      {label}
    </button>
  );

  const textarea = (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      rows={rows}
      placeholder={placeholder ?? "Escreve aqui… (Markdown: **negrito**, ## título, - lista)"}
      className="w-full resize-y bg-transparent p-3 font-mono text-sm leading-relaxed outline-none"
    />
  );
  const preview = (
    <div
      className="prose-cadenza flex min-h-[200px] flex-col gap-3 p-3 text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html || '<p class="text-black/40">Nada para pré-visualizar.</p>' }}
    />
  );

  return (
    <div className="overflow-hidden rounded-lg border border-black/15 dark:border-white/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-black/10 bg-black/[0.02] px-2 py-1 dark:border-white/10 dark:bg-white/[0.03]">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            title={a.label}
            aria-label={a.label}
            onClick={() => apply(a)}
            disabled={mode === "preview"}
            className="rounded p-1.5 text-black/60 hover:bg-black/5 hover:text-black disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <a.icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Imagem da biblioteca"
          aria-label="Imagem"
          onClick={() => setPicker(true)}
          disabled={mode === "preview"}
          className="rounded p-1.5 text-black/60 hover:bg-black/5 hover:text-black disabled:opacity-30 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <div className="ml-auto flex items-center gap-1">
          {tab("write", "Escrever")}
          {tab("split", "Lado a lado")}
          {tab("preview", "Pré-visualizar")}
        </div>
      </div>

      {mode === "write" && textarea}
      {mode === "preview" && preview}
      {mode === "split" && (
        <div className="grid grid-cols-1 divide-y divide-black/10 md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-white/10">
          {textarea}
          <div className="max-h-[60vh] overflow-y-auto">{preview}</div>
        </div>
      )}

      <div className="flex justify-between border-t border-black/10 px-3 py-1.5 text-[11px] text-black/40 dark:border-white/10 dark:text-white/40">
        <span>Markdown · Ctrl+B negrito · Ctrl+I itálico · Ctrl+K link</span>
        <span>{words} palavras · ~{minutes} min de leitura</span>
      </div>

      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onSelect={(m) => insertImage(m.url, m.alt ?? "")}
        />
      )}
    </div>
  );
}
