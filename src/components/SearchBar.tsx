"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/forum?q=${encodeURIComponent(q)}` : "/forum");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden flex-1 sm:flex sm:max-w-md"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="search"
        placeholder="Pesquisar no fórum..."
        className="w-full rounded-full border border-black/15 dark:border-white/20 bg-transparent px-4 py-1.5 text-sm"
      />
    </form>
  );
}
