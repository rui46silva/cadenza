"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyProfessorButtons({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: "APPROVED" | "REJECTED") {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setStatus("APPROVED")}
        disabled={loading}
        className="rounded-md border border-emerald-500 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-sm disabled:opacity-50"
      >
        Aprovar
      </button>
      <button
        onClick={() => setStatus("REJECTED")}
        disabled={loading}
        className="rounded-md border border-rose-500 text-rose-600 dark:text-rose-400 px-3 py-1 text-sm disabled:opacity-50"
      >
        Rejeitar
      </button>
    </div>
  );
}
