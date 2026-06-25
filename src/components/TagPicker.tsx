"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORY_LABELS } from "@/lib/tagCategories";

type TagOption = {
  id: string;
  name: string;
  category: keyof typeof CATEGORY_LABELS;
};

export default function TagPicker({
  name,
  selected,
  onChange,
}: {
  name: string;
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [options, setOptions] = useState<TagOption[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setOptions(data.tags ?? []))
      .catch(() => {});
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return options
      .filter(
        (t) => t.name.toLowerCase().includes(q) && !selected.includes(t.name)
      )
      .slice(0, 8);
  }, [options, query, selected]);

  function addTag(tagName: string) {
    const value = tagName.trim().toLowerCase();
    if (!value || selected.includes(value) || selected.length >= 8) return;
    onChange([...selected, value]);
    setQuery("");
  }

  function removeTag(tagName: string) {
    onChange(selected.filter((t) => t !== tagName));
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={selected.join(",")} />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => removeTag(tagName)}
              className="rounded-full bg-accent/15 text-accent px-2.5 py-1 text-xs hover:bg-accent/25"
            >
              #{tagName} ×
            </button>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(query);
            }
          }}
          placeholder="Adicionar tag (ex: piano, jazz, iniciante)"
          className="w-full rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
            {suggestions.map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-sm hover:bg-accent/10"
                >
                  <span>#{tag.name}</span>
                  <span className="text-xs text-black/40 dark:text-white/40">
                    {CATEGORY_LABELS[tag.category]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
