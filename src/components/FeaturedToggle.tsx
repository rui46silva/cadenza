"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function FeaturedToggle({
  userId,
  featured,
}: {
  userId: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/featured`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // 30 dias de destaque ao ativar; 0 remove.
      body: JSON.stringify({ days: featured ? 0 : 30 }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs disabled:opacity-50 ${
        featured
          ? "border-transparent bg-accent text-accent-foreground"
          : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
      }`}
    >
      <Star className="h-3.5 w-3.5" />
      {featured ? "Remover destaque" : "Destacar perfil"}
    </button>
  );
}
