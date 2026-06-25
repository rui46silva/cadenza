"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CategoryDropdown from "@/components/CategoryDropdown";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(qs ? `/forum?${qs}` : "/forum");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden flex-1 items-center gap-2 sm:flex sm:max-w-md"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="search"
        placeholder="Pesquisar no fórum..."
        className="w-full rounded-full border border-black/15 dark:border-white/20 bg-transparent px-4 py-1.5 text-sm"
      />
      <CategoryDropdown value={category} onChange={setCategory} />
    </form>
  );
}
