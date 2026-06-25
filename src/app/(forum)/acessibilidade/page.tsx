export default function AcessibilidadePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Acessibilidade</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        O Cadenza está a trabalhar para que a plataforma seja utilizável por
        todos, independentemente das capacidades de cada pessoa.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">O que já fazemos</h2>
        <ul className="list-disc pl-5 text-sm text-black/60 dark:text-white/60 flex flex-col gap-1">
          <li>Suporte a modo claro e escuro com bom contraste de texto.</li>
          <li>Navegação por teclado em links, botões e formulários.</li>
          <li>Estrutura semântica de cabeçalhos e marcação HTML.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Encontraste um problema?</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Se encontraste alguma barreira de acessibilidade no Cadenza, conta-
          nos para podermos corrigir.
        </p>
      </section>
    </div>
  );
}
