"use client";

import { useState, type ReactNode } from "react";

/**
 * Separadores no perfil entre posts normais e dúvidas colocadas. Recebe os dois
 * painéis já renderizados no servidor e só alterna qual está visível.
 */
export default function ProfileTabs({
  posts,
  questions,
  postCount,
  questionCount,
}: {
  posts: ReactNode;
  questions: ReactNode;
  postCount: number;
  questionCount: number;
}) {
  const [tab, setTab] = useState<"posts" | "questions">("posts");

  const tabClass = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm transition-colors ${
      active
        ? "bg-accent text-accent-foreground font-medium"
        : "text-black/60 dark:text-white/60 hover:text-accent"
    }`;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex gap-1 self-start rounded-full border border-black/10 dark:border-white/10 p-1">
        <button type="button" onClick={() => setTab("posts")} className={tabClass(tab === "posts")}>
          Posts ({postCount})
        </button>
        <button
          type="button"
          onClick={() => setTab("questions")}
          className={tabClass(tab === "questions")}
        >
          Dúvidas ({questionCount})
        </button>
      </div>
      {tab === "posts" ? posts : questions}
    </section>
  );
}
