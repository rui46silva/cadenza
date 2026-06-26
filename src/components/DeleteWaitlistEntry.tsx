"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteWaitlistEntry({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Eliminar esta inscrição da lista de espera?")) return;
    setLoading(true);
    await fetch(`/api/admin/waitlist/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-rose-500 hover:text-rose-500 disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
