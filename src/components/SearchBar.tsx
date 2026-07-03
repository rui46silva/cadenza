"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import CategoryDropdown from "@/components/CategoryDropdown";

type TrendingTag = { id: string; name: string; postCount: number };

export default function SearchBar({
  className = "hidden flex-1 items-center gap-2 lg:flex lg:max-w-md",
  showCategory = true,
}: {
  className?: string;
  showCategory?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [trending, setTrending] = useState<TrendingTag[] | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function loadTrending() {
    if (trending !== null) return;
    fetch("/api/tags/trending")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTrending(data?.tags ?? []))
      .catch(() => setTrending([]));
  }

  function goToTag(name: string) {
    setOpen(false);
    router.push(`/forum?tag=${encodeURIComponent(name)}`);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOpen(false);
    const q = value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(qs ? `/forum?${qs}` : "/forum");
  }

  if (pathname === "/") return null;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div ref={wrapperRef} className="relative w-full">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            setOpen(true);
            loadTrending();
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          type="search"
          placeholder="Pesquisar no fórum..."
          className="w-full rounded-full border border-black/15 dark:border-white/20 bg-transparent px-4 py-1.5 text-sm"
        />
        {open && !value && trending && trending.length > 0 && (
          <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-black shadow-md">
            <p className="flex items-center gap-1.5 px-3 pt-2 text-xs font-medium text-black/40 dark:text-white/40">
              <TrendingUp className="h-3.5 w-3.5" />
              Tópicos e comunidades em alta
            </p>
            <ul className="flex flex-wrap gap-1.5 p-2">
              {trending.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToTag(t.name)}
                    className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent"
                  >
                    #{t.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {showCategory && <CategoryDropdown value={category} onChange={setCategory} />}
    </form>
  );
}
