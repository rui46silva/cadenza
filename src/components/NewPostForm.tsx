"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Video, HelpCircle, X } from "lucide-react";
import { event } from "@/lib/gtag";
import { buttonPrimary } from "@/lib/ui";
import TagPicker from "@/components/TagPicker";

export default function NewPostForm({
  initialQuestion = false,
  directedTo = null,
}: {
  initialQuestion?: boolean;
  directedTo?: { id: string; name: string } | null;
}) {
  const router = useRouter();
  const [type, setType] = useState<"TEXT" | "VIDEO">("TEXT");
  const [isQuestion, setIsQuestion] = useState(initialQuestion);
  const [directed, setDirected] = useState(directedTo);
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
      isQuestion,
      directedToId: isQuestion && directed ? directed.id : undefined,
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
    event("create_post", { post_type: type, is_question: isQuestion });
    router.push(`/posts/${post.id}`);
  }

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4">
        {isQuestion ? "Tirar dúvida" : "Novo post"}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="title"
          placeholder={isQuestion ? "Qual é a tua dúvida?" : "Título"}
          required
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />

        <div className="flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() => setIsQuestion((v) => !v)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm border transition-colors ${
              isQuestion
                ? "bg-sky-500 text-white border-sky-500"
                : "border-black/15 dark:border-white/20 hover:border-sky-500 hover:text-sky-500"
            }`}
            title="Marca como dúvida para os professores verificados a verem na fila de dúvidas"
          >
            <HelpCircle className="h-4 w-4" />
            É uma dúvida
          </button>
        </div>

        {isQuestion && (
          <p className="rounded-md bg-sky-500/10 px-3 py-2 text-sm text-sky-700 dark:text-sky-300">
            {directed ? (
              <span className="flex items-center justify-between gap-2">
                <span>
                  Dúvida dirigida a <strong>{directed.name}</strong> — vai ser
                  notificado, e a resposta fica pública para ajudar toda a gente.
                </span>
                <button
                  type="button"
                  onClick={() => setDirected(null)}
                  title="Remover destinatário"
                  className="shrink-0 rounded-full p-1 hover:bg-sky-500/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ) : (
              <>
                A tua dúvida entra na fila dos professores certificados e
                profissionais verificados. Adiciona a tag do teu instrumento
                para chegar aos professores certos.
              </>
            )}
          </p>
        )}

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
            isQuestion
              ? "Descreve a tua dúvida com o máximo de detalhe..."
              : type === "VIDEO"
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
