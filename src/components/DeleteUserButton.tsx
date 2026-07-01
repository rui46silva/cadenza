"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível eliminar o utilizador.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-rose-500 hover:text-rose-500"
      >
        Eliminar
      </button>
      {open && (
        <ConfirmDialog
          title="Eliminar utilizador"
          description="Esta ação elimina permanentemente a conta e todos os posts/comentários dele. Não pode ser desfeita."
          confirmLabel="Eliminar conta"
          requireText="DELETE"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => setOpen(false)}
          error={error}
        />
      )}
    </>
  );
}
