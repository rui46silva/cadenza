import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@cadenza.app";
const ADMIN_PASSWORD = "password123";

const CONTENT = `Bem-vindos à Cadenza! 🎵

Este é o ponto de partida da nossa comunidade de músicos — o sítio para partilhar o que tocas, pedir feedback, tirar dúvidas técnicas e conhecer outros alunos e professores. Antes de publicares o teu primeiro post, aqui fica tudo o que precisas de saber.

O QUE PODES FAZER AQUI
- Publicar vídeos das tuas interpretações ou textos (dicas, dúvidas, pedidos de feedback).
- Comentar e votar nas publicações de outros membros.
- Filtrar o fórum por categorias e etiquetas (instrumento, género, nível).
- Criar uma conta de Professor para receberes o selo de verificado depois de uma validação manual.

COMO PUBLICAR
Vai a "Novo post", escolhe entre vídeo ou texto, escreve um título claro e adiciona etiquetas relevantes (ex: piano, jazz, iniciante) para que outros membros encontrem facilmente o teu conteúdo.

REGRAS DA COMUNIDADE
1. Respeito acima de tudo — sem assédio, discurso de ódio ou ataques pessoais.
2. Conteúdo relevante — publica apenas sobre música.
3. Sem spam ou autopromoção excessiva.
4. Respeita direitos de autor — só partilha o que tens o direito de partilhar.
5. Contas de professor passam por verificação manual.

Consulta a página de Regras para o detalhe completo, incluindo o sistema de moderação e banimentos.

MODERAÇÃO
Temos uma equipa de administradores e moderadores que vela pelo cumprimento destas regras. Conteúdo que viole as regras pode ser removido e contas reincidentes podem ser banidas, com duração consoante a gravidade da infração.

Agora é a tua vez — apresenta-te nos comentários: que instrumento tocas e o que esperas encontrar aqui. Bem-vindo(a) à Cadenza!`;

async function main() {
  console.log("A apagar todos os dados existentes (posts, comentários, contas)...");

  await prisma.notification.deleteMany();
  await prisma.ban.deleteMany();
  await prisma.postVote.deleteMany();
  await prisma.commentVote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log("A criar conta admin...");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Cadenza",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("A criar post de arranque...");
  const tag = await prisma.tag.upsert({
    where: { name: "comunidade" },
    update: {},
    create: { name: "comunidade", category: "OTHER" },
  });

  const post = await prisma.post.create({
    data: {
      id: "launch-post",
      title: "Bem-vindos à Cadenza — começa por aqui",
      type: "TEXT",
      content: CONTENT,
      pinned: true,
      authorId: admin.id,
      tags: { create: [{ tagId: tag.id }] },
    },
  });

  console.log("Concluído:", { admin: admin.email, post: post.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
