"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteWaitlistEntry({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/waitlist/${id}`, { method: "DELETE" });
    setLoading(false);
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
          title="Eliminar inscrição"
          description="Remove esta entrada da lista de espera."
          confirmLabel="Eliminar"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
