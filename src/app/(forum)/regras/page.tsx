import { INFRACTION_LABELS, INFRACTION_ORDER, INFRACTION_SUGGESTED_DAYS } from "@/lib/moderation";

const RULES = [
  {
    title: "1. Respeito acima de tudo",
    description:
      "Sem assédio, discurso de odio ou ataques pessoais. Discorda das ideias, não das pessoas.",
  },
  {
    title: "2. Conteúdo relevante",
    description:
      "Publica apenas conteúdo relacionado com música — partilhas de trabalho, pedidos de feedback, dúvidas técnicas, etc.",
  },
  {
    title: "3. Sem spam ou autopromoção excessiva",
    description:
      "Podes partilhar o teu trabalho, mas evita publicar repetidamente o mesmo conteúdo ou links não relacionados.",
  },
  {
    title: "4. Direitos de autor",
    description:
      "Só partilha conteúdo (vídeos, áudio, partituras) que tenhas o direito de partilhar.",
  },
  {
    title: "5. Verificação de professores",
    description:
      "Contas de professor passam por uma verificação manual antes de receberem o selo de verificado.",
  },
];

export default function RegrasPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Regras do fórum</h1>
      <ul className="flex flex-col gap-4">
        {RULES.map((rule) => (
          <li
            key={rule.title}
            className="rounded-lg border border-black/10 dark:border-white/10 p-4"
          >
            <h2 className="font-semibold">{rule.title}</h2>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {rule.description}
            </p>
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Moderação e banimentos</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Administradores e moderadores podem fixar publicações, remover
          conteúdo e banir contas que violem as regras acima. A duração do
          banimento depende do tipo de infração, podendo ser permanente em
          casos de reincidência ou gravidade.
        </p>
        <ul className="flex flex-col gap-3">
          {INFRACTION_ORDER.map((infraction) => {
            const days = INFRACTION_SUGGESTED_DAYS[infraction];
            return (
              <li
                key={infraction}
                className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex items-center justify-between gap-4"
              >
                <span className="font-medium">{INFRACTION_LABELS[infraction]}</span>
                <span className="text-sm text-black/50 dark:text-white/50">
                  {days === null ? "Banimento permanente" : `Até ${days} dias`}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-black/60 dark:text-white/60">
          Uma conta banida não consegue iniciar sessão durante o período do
          banimento. Se consideras que o banimento foi um erro, contacta a
          equipa de moderação.
        </p>
      </section>
    </div>
  );
}
