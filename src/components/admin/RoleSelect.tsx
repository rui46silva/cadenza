"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

const OPTIONS = [
  { value: "ALUNO", label: "Membro" },
  { value: "MODERATOR", label: "Moderador" },
  { value: "EDITOR", label: "Editor de conteúdo" },
];

/** Atribui papéis de equipa (moderador / editor) a membros. */
export default function RoleSelect({ userId, role }: { userId: string; role: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function change(next: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    setLoading(false);
    if (!res.ok) return toast("Não foi possível alterar o papel.", "error");
    toast("Papel atualizado");
    router.refresh();
  }

  return (
    <select
      value={role}
      disabled={loading}
      onChange={(e) => change(e.target.value)}
      aria-label="Papel"
      className="rounded-full border border-black/15 bg-transparent px-2 py-1 text-xs disabled:opacity-50 dark:border-white/20"
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
