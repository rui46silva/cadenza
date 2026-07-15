"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

type Profile = {
  name: string;
  bio: string | null;
  instrument: string | null;
  gender: string | null;
  avatarUrl: string | null;
  instagramHandle: string | null;
};

const inputClass =
  "rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      bio: formData.get("bio"),
      instrument: formData.get("instrument"),
      gender: formData.get("gender"),
      avatarUrl: formData.get("avatarUrl"),
      instagramHandle: formData.get("instagramHandle"),
    };

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível guardar as alterações.");
      return;
    }

    toast("Perfil atualizado");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm flex flex-col gap-1">
          Nome
          <input name="name" defaultValue={profile.name} required className={inputClass} />
        </label>

        <label className="text-sm flex flex-col gap-1">
          Instrumento
          <input
            name="instrument"
            defaultValue={profile.instrument ?? ""}
            placeholder="ex: piano, saxofone"
            className={inputClass}
          />
        </label>

        <label className="text-sm flex flex-col gap-1">
          Género
          <div className="relative">
            <select
              name="gender"
              defaultValue={profile.gender ?? ""}
              className={`${inputClass} w-full appearance-none pr-9 cursor-pointer [&>option]:bg-white dark:[&>option]:bg-neutral-900`}
            >
              <option value="">Prefiro não indicar</option>
              <option value="FEMININO">Feminino</option>
              <option value="MASCULINO">Masculino</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
          </div>
          <span className="text-xs text-black/40 dark:text-white/40">
            Usado só para ajustar o teu papel (ex: Professora, Aluna).
          </span>
        </label>

        <label className="text-sm flex flex-col gap-1">
          Instagram
          <div className="flex items-center rounded-md border border-black/15 dark:border-white/20 bg-transparent overflow-hidden focus-within:outline focus-within:outline-2 focus-within:outline-accent">
            <span className="px-3 text-black/40 dark:text-white/40">@</span>
            <input
              name="instagramHandle"
              defaultValue={profile.instagramHandle ?? ""}
              placeholder="o.teu.utilizador"
              maxLength={30}
              pattern="[a-zA-Z0-9._]*"
              className="flex-1 py-2 pr-3 bg-transparent outline-none"
            />
          </div>
        </label>

        <label className="text-sm flex flex-col gap-1 sm:col-span-2">
          URL da foto de perfil
          <input
            name="avatarUrl"
            type="url"
            defaultValue={profile.avatarUrl ?? ""}
            placeholder="https://..."
            className={inputClass}
          />
        </label>

        <label className="text-sm flex flex-col gap-1 sm:col-span-2">
          Bio
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={4}
            placeholder="Conta um pouco sobre ti, o que tocas e o que procuras na Cadenza."
            className={inputClass}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-accent text-accent-foreground px-4 py-2 shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "A guardar..." : "Guardar alterações"}
      </button>
    </form>
  );
}
