"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";

export default function SponsorPostButton({
  postId,
  sponsored,
  sponsorName,
  sponsorUrl,
}: {
  postId: string;
  sponsored: boolean;
  sponsorName?: string | null;
  sponsorUrl?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(sponsorName ?? "");
  const [url, setUrl] = useState(sponsorUrl ?? "");
  const [loading, setLoading] = useState(false);

  async function save(newSponsored: boolean) {
    setLoading(true);
    await fetch(`/api/admin/posts/${postId}/sponsor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sponsored: newSponsored, sponsorName: name, sponsorUrl: url }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (sponsored) {
    return (
      <button
        type="button"
        onClick={() => save(false)}
        disabled={loading}
        className="flex items-center gap-1 rounded-full border border-amber-500 px-3 py-1 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white disabled:opacity-50"
      >
        <Megaphone className="h-3.5 w-3.5" />
        Remover patrocínio
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs hover:border-amber-500 hover:text-amber-500"
      >
        <Megaphone className="h-3.5 w-3.5" />
        Marcar patrocinado
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Marca patrocinadora (ex: Thomann)"
        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL da marca (opcional)"
        type="url"
        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => save(true)}
          disabled={loading}
          className="rounded-md bg-amber-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "A guardar..." : "Confirmar patrocínio"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-1 text-xs"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
