export default function PrivacidadePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Política de privacidade</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        Este documento resume, em linguagem simples, como o Cadenza trata os
        teus dados. Não substitui aconselhamento jurídico.
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Dados que recolhemos</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Nome, email, password (encriptada), instrumento, biografia e
          fotografia de perfil que decidas adicionar, além dos posts,
          comentários e votos que crias na plataforma.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Como usamos os dados</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Para autenticar a tua conta, mostrar o teu perfil a outros membros e
          melhorar a experiência no fórum. Não vendemos os teus dados.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Publicidade</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Quando ativa, a publicidade é fornecida pela Google AdSense e só é
          mostrada depois de dares o teu consentimento explícito através do
          banner de cookies.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Os teus direitos</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Podes editar ou eliminar o teu perfil em qualquer momento na página
          do teu painel. Para pedidos relacionados com RGPD, contacta a
          equipa do Cadenza.
        </p>
      </section>
    </div>
  );
}
