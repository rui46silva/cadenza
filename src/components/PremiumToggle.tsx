"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

export default function PremiumToggle({
  userId,
  isPremium,
}: {
  userId: string;
  isPremium: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/premium`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // Concede 12 meses ao ativar.
      body: JSON.stringify({ isPremium: !isPremium, months: !isPremium ? 12 : undefined }),
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
        isPremium
          ? "border-transparent bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
          : "border-black/15 dark:border-white/20 hover:border-amber-500 hover:text-amber-500"
      }`}
    >
      <Crown className="h-3.5 w-3.5" />
      {isPremium ? "Remover Premium" : "Dar Premium"}
    </button>
  );
}
