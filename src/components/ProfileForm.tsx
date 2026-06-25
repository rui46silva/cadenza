"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  bio: string | null;
  instrument: string | null;
  avatarUrl: string | null;
  instagramHandle: string | null;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      bio: formData.get("bio"),
      instrument: formData.get("instrument"),
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

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <label className="text-sm flex flex-col gap-1">
        Nome
        <input
          name="name"
          defaultValue={profile.name}
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      <label className="text-sm flex flex-col gap-1">
        Instrumento
        <input
          name="instrument"
          defaultValue={profile.instrument ?? ""}
          placeholder="ex: piano, saxofone"
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      <label className="text-sm flex flex-col gap-1">
        Bio
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          rows={3}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      <label className="text-sm flex flex-col gap-1">
        Instagram
        <div className="flex items-center rounded-md border border-black/15 dark:border-white/20 bg-transparent overflow-hidden">
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

      <label className="text-sm flex flex-col gap-1">
        URL da foto de perfil
        <input
          name="avatarUrl"
          type="url"
          defaultValue={profile.avatarUrl ?? ""}
          placeholder="https://..."
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Perfil atualizado.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-accent text-accent-foreground px-3 py-2 shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "A guardar..." : "Guardar alterações"}
      </button>
    </form>
  );
}
