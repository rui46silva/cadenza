import type { PrismaClient } from "@prisma/client";

const WELCOME_TITLE = "Bem-vindos à Cadenza — começa por aqui";
const WELCOME_SLUG = "bem-vindos-a-cadenza-comeca-por-aqui";
const WELCOME_CONTENT = `Bem-vindos à Cadenza! 🎵

Este é o ponto de partida da nossa comunidade de músicos — o sítio para partilhar o que tocas, pedir feedback, tirar dúvidas técnicas e conhecer outros alunos e professores.

O QUE PODES FAZER AQUI
- Publicar vídeos das tuas interpretações ou textos (dicas, dúvidas, pedidos de feedback).
- Comentar e votar nas publicações de outros membros.
- Seguir etiquetas (instrumento, género, nível) para teres um feed "Para ti".

Apresenta-te nos comentários: que instrumento tocas e o que esperas encontrar aqui. Bem-vindo(a)!`;

/**
 * Reset de lançamento: limpa o conteúdo de exemplo para a plataforma arrancar
 * "vazia", passando a ser os utilizadores reais a criar o conteúdo.
 *
 * PRESERVA: lista de espera, contas de admin, notícias/vagas criadas por admins,
 * metadados de SEO (PageMeta) e as tags.
 * APAGA: posts, comentários, votos, notificações, reports, bans; contas não-admin
 * (as de exemplo); notícias/vagas de não-admins.
 */
export async function runLaunchReset(prisma: PrismaClient) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  const adminIds = admins.map((a) => a.id);

  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.postVote.deleteMany();
  await prisma.commentVote.deleteMany();
  await prisma.ban.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.comment.deleteMany(); // Post.bestAnswerId fica a null automaticamente
  const { count: deletedPosts } = await prisma.post.deleteMany();
  await prisma.tagFollow.deleteMany();

  await prisma.newsArticle.deleteMany({ where: { createdById: { notIn: adminIds } } });
  await prisma.jobListing.deleteMany({ where: { createdById: { notIn: adminIds } } });

  const { count: deletedUsers } = await prisma.user.deleteMany({
    where: { role: { not: "ADMIN" } },
  });

  // Post de boas-vindas fixado (só se houver admin).
  const firstAdminId = adminIds[0];
  if (firstAdminId) {
    const tag = await prisma.tag.upsert({
      where: { name: "comunidade" },
      update: {},
      create: { name: "comunidade", category: "OTHER" },
    });
    await prisma.post.create({
      data: {
        slug: WELCOME_SLUG,
        title: WELCOME_TITLE,
        type: "TEXT",
        content: WELCOME_CONTENT,
        pinned: true,
        authorId: firstAdminId,
        tags: { create: [{ tagId: tag.id }] },
      },
    });
  }

  const waitlist = await prisma.waitlistSignup.count();
  return { deletedPosts, deletedUsers, adminsPreserved: adminIds.length, waitlist };
}
