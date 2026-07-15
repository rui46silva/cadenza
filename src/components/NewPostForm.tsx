"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Video, HelpCircle, Music, Trophy } from "lucide-react";
import { event } from "@/lib/gtag";
import { buttonPrimary } from "@/lib/ui";
import { COMMON_INSTRUMENTS } from "@/lib/instruments";
import TagPicker from "@/components/TagPicker";
import ExpertPicker, { type Expert } from "@/components/ExpertPicker";
import { useToast } from "@/components/ToastProvider";

const INSTRUMENT_SET = new Set(COMMON_INSTRUMENTS.map((i) => i.toLowerCase()));

export default function NewPostForm({
  initialQuestion = false,
  initialFeedback = false,
  initialVideo = false,
  directedTo = null,
  challenge = null,
}: {
  initialQuestion?: boolean;
  initialFeedback?: boolean;
  initialVideo?: boolean;
  directedTo?: Expert | null;
  challenge?: { title: string; prompt: string } | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [type, setType] = useState<"TEXT" | "VIDEO">(
    initialFeedback || initialVideo || challenge ? "VIDEO" : "TEXT"
  );
  const [isQuestion, setIsQuestion] = useState(initialQuestion);
  const [feedbackRequest, setFeedbackRequest] = useState(initialFeedback);
  const [directed, setDirected] = useState<Expert | null>(directedTo);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Instrumento inferido das tags escolhidas, para sugerir os especialistas certos.
  const instrumentTag = tags.find((t) => INSTRUMENT_SET.has(t.toLowerCase()));
  const wantsFeedback = feedbackRequest && type === "VIDEO";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const content = formData.get("content");
    const videoUrl = formData.get("videoUrl");

    const payload = {
      title: formData.get("title"),
      type,
      content: content || undefined,
      videoUrl: type === "VIDEO" ? videoUrl || undefined : undefined,
      tagNames: tags,
      isQuestion,
      directedToId: isQuestion && directed ? directed.id : undefined,
      feedbackRequest: wantsFeedback,
      feedbackFocus: wantsFeedback ? formData.get("feedbackFocus") || undefined : undefined,
      joinChallenge: Boolean(challenge),
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
    toast(
      challenge
        ? "Participação no desafio publicada! 🎉"
        : isQuestion
        ? directed
          ? `Dúvida enviada a ${directed.name}`
          : "Dúvida publicada — os profissionais foram notificados"
        : wantsFeedback
        ? "Pedido de feedback publicado"
        : "Post publicado"
    );
    router.push(`/posts/${post.id}`);
  }

  const title = challenge
    ? "Participar no desafio"
    : isQuestion
    ? "Tirar dúvida"
    : wantsFeedback
    ? "Pedir feedback"
    : "Novo post";

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-4">{title}</h1>

      {challenge && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
          <Trophy className="h-5 w-5 shrink-0 text-accent" />
          <div className="text-sm">
            <p className="font-semibold">Desafio da semana: {challenge.title}</p>
            <p className="text-black/60 dark:text-white/60">{challenge.prompt}</p>
          </div>
        </div>
      )}

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
          {!challenge && (
            <button
              type="button"
              onClick={() => setIsQuestion((v) => !v)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm border transition-colors ${
                isQuestion
                  ? "bg-sky-500 text-white border-sky-500"
                  : "border-black/15 dark:border-white/20 hover:border-sky-500 hover:text-sky-500"
              }`}
              title="Marca como dúvida para os profissionais verificados a verem na fila de dúvidas"
            >
              <HelpCircle className="h-4 w-4" />
              É uma dúvida
            </button>
          )}
          {type === "VIDEO" && !isQuestion && !challenge && (
            <button
              type="button"
              onClick={() => setFeedbackRequest((v) => !v)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm border transition-colors ${
                feedbackRequest
                  ? "bg-fuchsia-500 text-white border-fuchsia-500"
                  : "border-black/15 dark:border-white/20 hover:border-fuchsia-500 hover:text-fuchsia-500"
              }`}
              title="Pede feedback ao vivo sobre o teu vídeo"
            >
              <Music className="h-4 w-4" />
              Pedir feedback
            </button>
          )}
        </div>

        {isQuestion && (
          <div className="flex flex-col gap-2 rounded-md bg-sky-500/10 p-3">
            <label className="text-sm font-medium text-sky-700 dark:text-sky-300">
              Dirigir a alguém em particular?
            </label>
            <ExpertPicker value={directed} onChange={setDirected} instrument={instrumentTag} />
            <p className="text-xs text-sky-700/80 dark:text-sky-300/80">
              {directed
                ? `${directed.name} vai ser notificado — a resposta fica pública para ajudar toda a gente.`
                : "Se não escolheres ninguém, a dúvida entra na fila de todos os profissionais do teu instrumento. Adiciona a tag do instrumento para chegar às pessoas certas."}
            </p>
          </div>
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

        {wantsFeedback && (
          <div className="flex flex-col gap-2 rounded-md bg-fuchsia-500/10 p-3">
            <label className="text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300">
              Em que queres feedback?
            </label>
            <input
              name="feedbackFocus"
              placeholder="ex: afinação nos agudos, ritmo no compasso 12, postura..."
              maxLength={300}
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent text-sm"
            />
            <p className="text-xs text-fuchsia-700/80 dark:text-fuchsia-300/80">
              Aparece na página de feedback para a comunidade e os profissionais te ajudarem.
            </p>
          </div>
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
