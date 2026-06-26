"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Eliminar este post permanentemente?")) return;
    setDeleting(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.push("/forum");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-1.5 rounded-full border border-rose-500 text-rose-500 px-3 py-1 text-xs hover:bg-rose-500/10 disabled:opacity-50"
    >
      {deleting ? "A eliminar..." : "Eliminar post"}
    </button>
  );
}
