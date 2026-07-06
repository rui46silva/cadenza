import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { buttonPrimarySm } from "@/lib/ui";

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
      className={`${buttonPrimarySm} flex items-center gap-1.5 ${className}`}
    >
      <HelpCircle className="h-4 w-4" />
      {label}
    </Link>
  );
}
