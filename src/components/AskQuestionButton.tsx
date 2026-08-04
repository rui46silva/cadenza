"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { buttonPrimarySm } from "@/lib/ui";
import { event } from "@/lib/gtag";

/**
 * Botão "Tirar dúvida" que abre o formulário de nova dúvida já dirigido a este
 * especialista. Usado em perfis e nos diretórios de professores/embaixadores.
 */
export default function AskQuestionButton({
  expertId,
  className = "",
  label = "Tirar dúvida",
}: {
  expertId: string;
  className?: string;
  label?: string;
}) {
  return (
    <Link
      href={`/posts/new?duvida=1&para=${expertId}`}
      onClick={() => event("ask_question_click", { expert_id: expertId })}
      className={`${buttonPrimarySm} flex items-center gap-1.5 ${className}`}
    >
      <HelpCircle className="h-4 w-4" />
      {label}
    </Link>
  );
}
