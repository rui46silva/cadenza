"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.push("/forum");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={deleting}
        className="flex items-center gap-1.5 rounded-full border border-rose-500 text-rose-500 px-3 py-1 text-xs hover:bg-rose-500/10 disabled:opacity-50"
      >
        {deleting ? "A eliminar..." : "Eliminar post"}
      </button>
      {open && (
        <ConfirmDialog
          title="Eliminar post"
          description="Esta ação elimina o post permanentemente, incluindo os comentários. Não pode ser desfeita."
          confirmLabel="Eliminar"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
