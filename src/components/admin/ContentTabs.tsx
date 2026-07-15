"use client";

import { useState } from "react";
import { Newspaper, Briefcase } from "lucide-react";

export default function ContentTabs({
  news,
  jobs,
}: {
  news: React.ReactNode;
  jobs: React.ReactNode;
}) {
  const [tab, setTab] = useState<"news" | "jobs">("news");

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-accent text-accent-foreground shadow-sm"
        : "border border-black/15 dark:border-white/20 hover:border-accent hover:text-accent"
    }`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTab("news")} className={tabClass(tab === "news")}>
          <Newspaper className="h-4 w-4" />
          Notícias
        </button>
        <button type="button" onClick={() => setTab("jobs")} className={tabClass(tab === "jobs")}>
          <Briefcase className="h-4 w-4" />
          Oportunidades
        </button>
      </div>

      <div>{tab === "news" ? news : jobs}</div>
    </div>
  );
}
