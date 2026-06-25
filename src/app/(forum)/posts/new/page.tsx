"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Video } from "lucide-react";
import { event } from "@/lib/gtag";
import { buttonPrimary } from "@/lib/ui";
import TagPicker from "@/components/TagPicker";

export default function NewPostPage() {
  const router = useRouter();
  const [type, setType] = useState<"TEXT" | "VIDEO">("TEXT");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tagNames = tags;

    const content = formData.get("content");
    const videoUrl = formData.get("videoUrl");

    const payload = {
      title: formData.get("title"),
      type,
      content: content || undefined,
      videoUrl: type === "VIDEO" ? videoUrl || undefined : undefined,
      tagNames,
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar o post.");
      return;
    }

    const { post } = await res.json();
    event("create_post", { post_type: type });
    router.push(`/posts/${post.id}`);
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4">Novo post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="title"
          placeholder="Título"
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("TEXT")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm border transition-colors ${
              type === "TEXT"
                ? "bg-accent text-accent-foreground border-accent"
                : "border-black/15 dark:border-white/20 hover:border-accent"
            }`}
          >
            <FileText className="h-4 w-4" />
            Texto
          </button>
          <button
            type="button"
            onClick={() => setType("VIDEO")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm border transition-colors ${
              type === "VIDEO"
                ? "bg-accent text-accent-foreground border-accent"
                : "border-black/15 dark:border-white/20 hover:border-accent"
            }`}
          >
            <Video className="h-4 w-4" />
            Vídeo
          </button>
        </div>

        {type === "VIDEO" && (
          <input
            name="videoUrl"
            type="url"
            placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
            required
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
        )}

        <textarea
          name="content"
          placeholder={
            type === "VIDEO"
              ? "Acrescenta uma descrição ou contexto (opcional)..."
              : "Escreve o teu post..."
          }
          rows={type === "VIDEO" ? 4 : 10}
          required={type === "TEXT"}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />

        <TagPicker name="tags" selected={tags} onChange={setTags} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`${buttonPrimary} disabled:opacity-50`}
        >
          {loading ? "A publicar..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
