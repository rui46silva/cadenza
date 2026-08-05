import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * RESET DE LANÇAMENTO (produção)
 * ------------------------------
 * Limpa o conteúdo de exemplo para a plataforma arrancar "vazia", passando a ser
 * os utilizadores reais a criar os posts.
 *
 * PRESERVA:
 *   - Lista de espera (WaitlistSignup)
 *   - Contas de administrador (role = ADMIN)
 *   - Notícias/vagas criadas por admins (conteúdo real)
 *   - Metadados de SEO das páginas (PageMeta) e as tags
 *
 * APAGA:
 *   - Todos os posts, comentários, votos, notificações, reports, bans
 *   - Todos os utilizadores que NÃO são admin (incl. as contas de exemplo)
 *   - Notícias/vagas criadas por não-admins (as de exemplo)
 *
 * IMPORTANTE: a demo deve ter a SUA PRÓPRIA base de dados (ver guia). Corre este
 * script apenas contra a BD de PRODUÇÃO. Como é destrutivo e irreversível, exige
 * a variável de ambiente CONFIRM_LAUNCH_RESET=yes.
 */

const WELCOME_TITLE = "Bem-vindos à Cadenza — começa por aqui";
const WELCOME_CONTENT = `Bem-vindos à Cadenza! 🎵

Este é o ponto de partida da nossa comunidade de músicos — o sítio para partilhar o que tocas, pedir feedback, tirar dúvidas técnicas e conhecer outros alunos e professores.

O QUE PODES FAZER AQUI
- Publicar vídeos das tuas interpretações ou textos (dicas, dúvidas, pedidos de feedback).
- Comentar e votar nas publicações de outros membros.
- Seguir etiquetas (instrumento, género, nível) para teres um feed "Para ti".

Apresenta-te nos comentários: que instrumento tocas e o que esperas encontrar aqui. Bem-vindo(a)!`;

async function main() {
  if (process.env.CONFIRM_LAUNCH_RESET !== "yes") {
    console.error(
      "\n⚠️  Reset abortado. Isto APAGA o conteúdo de exemplo da base de dados apontada por DATABASE_URL.\n" +
        "Confirma que estás na BD de PRODUÇÃO e corre novamente com CONFIRM_LAUNCH_RESET=yes.\n"
    );
    process.exit(1);
  }

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  const adminIds = admins.map((a) => a.id);
  console.log(`Admins preservados: ${adminIds.length}`);

  console.log("A apagar conteúdo de exemplo (posts, comentários, votos, notificações)...");
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.postVote.deleteMany();
  await prisma.commentVote.deleteMany();
  await prisma.ban.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.comment.deleteMany(); // Post.bestAnswerId fica a null automaticamente
  await prisma.post.deleteMany();
  await prisma.tagFollow.deleteMany();

  console.log("A apagar notícias/vagas de exemplo (mantendo as criadas por admins)...");
  await prisma.newsArticle.deleteMany({ where: { createdById: { notIn: adminIds } } });
  await prisma.jobListing.deleteMany({ where: { createdById: { notIn: adminIds } } });

  console.log("A apagar contas de exemplo (todas as que não são admin)...");
  const { count: deletedUsers } = await prisma.user.deleteMany({
    where: { role: { not: "ADMIN" } },
  });
  console.log(`Contas apagadas: ${deletedUsers}`);

  // Garante que existe pelo menos um admin (cria um a partir de env se necessário).
  let firstAdminId = adminIds[0];
  if (!firstAdminId) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.warn(
        "Nenhum admin encontrado e ADMIN_EMAIL/ADMIN_PASSWORD não definidos — a saltar criação de admin."
      );
    } else {
      const admin = await prisma.user.create({
        data: {
          name: "Admin Cadenza",
          email,
          passwordHash: await bcrypt.hash(password, 12),
          role: "ADMIN",
          emailVerified: new Date(),
          onboardedAt: new Date(),
        },
      });
      firstAdminId = admin.id;
      console.log("Admin criado:", email);
    }
  }

  // Post de boas-vindas fixado (opcional; só se houver admin).
  if (firstAdminId) {
    const tag = await prisma.tag.upsert({
      where: { name: "comunidade" },
      update: {},
      create: { name: "comunidade", category: "OTHER" },
    });
    await prisma.post.create({
      data: {
        slug: "bem-vindos-a-cadenza-comeca-por-aqui",
        title: WELCOME_TITLE,
        type: "TEXT",
        content: WELCOME_CONTENT,
        pinned: true,
        authorId: firstAdminId,
        tags: { create: [{ tagId: tag.id }] },
      },
    });
    console.log("Post de boas-vindas criado.");
  }

  const waitlist = await prisma.waitlistSignup.count();
  console.log(`\n✅ Reset concluído. Lista de espera preservada: ${waitlist} inscritos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
