import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { buttonPrimary } from "@/lib/ui";

const STATUS_CONTENT = {
  sucesso: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    title: "Email confirmado!",
    message: "A tua conta está agora verificada. Já podes participar em pleno na comunidade.",
  },
  expirado: {
    icon: Clock,
    color: "text-amber-500",
    title: "O link expirou",
    message: "Este link de confirmação já não é válido. Pede um novo no teu painel.",
  },
  invalido: {
    icon: XCircle,
    color: "text-red-500",
    title: "Link inválido",
    message: "Não conseguimos confirmar o teu email. Pede um novo link no teu painel.",
  },
} as const;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const content =
    STATUS_CONTENT[status as keyof typeof STATUS_CONTENT] ?? STATUS_CONTENT.invalido;
  const Icon = content.icon;

  return (
    <div className="flex w-full justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-black/10 dark:border-white/10 p-8 text-center">
        <Icon className={`h-12 w-12 ${content.color}`} />
        <h1 className="text-xl font-bold">{content.title}</h1>
        <p className="text-sm text-black/60 dark:text-white/60">{content.message}</p>
        <Link href="/dashboard" className={buttonPrimary}>
          Ir para o meu perfil
        </Link>
      </div>
    </div>
  );
}
