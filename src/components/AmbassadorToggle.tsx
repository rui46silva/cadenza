"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function AmbassadorToggle({
  userId,
  isAmbassador,
}: {
  userId: string;
  isAmbassador: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/ambassador`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAmbassador: !isAmbassador }),
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
        isAmbassador
          ? "border-transparent bg-gradient-to-r from-amber-400 via-fuchsia-500 to-accent text-white"
          : "border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {isAmbassador ? "Remover embaixador" : "Tornar embaixador"}
    </button>
  );
}
