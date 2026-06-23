import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cadenza.app" },
    update: {},
    create: {
      name: "Admin Cadenza",
      email: "admin@cadenza.app",
      passwordHash,
      role: "ADMIN",
    },
  });

  const professor = await prisma.user.upsert({
    where: { email: "professor@cadenza.app" },
    update: {},
    create: {
      name: "Maria Costa",
      email: "professor@cadenza.app",
      passwordHash,
      role: "PROFESSOR",
      bio: "Professora de piano clássico, 15 anos de experiência.",
    },
  });

  const aluno = await prisma.user.upsert({
    where: { email: "aluno@cadenza.app" },
    update: {},
    create: {
      name: "João Silva",
      email: "aluno@cadenza.app",
      passwordHash,
      role: "ALUNO",
      bio: "A aprender saxofone, adoro jazz.",
    },
  });

  const tagNames = ["piano", "saxofone", "jazz", "clássica", "pop", "iniciante"];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const byName = (n: string) => tags.find((t) => t.name === n)!;

  await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      title: "A minha primeira interpretação de Nocturne de Chopin",
      type: "VIDEO",
      videoUrl: "https://www.youtube.com/watch?v=9E6b3swbnWg",
      authorId: aluno.id,
      tags: {
        create: [
          { tagId: byName("piano").id },
          { tagId: byName("clássica").id },
        ],
      },
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-2" },
    update: {},
    create: {
      id: "seed-post-2",
      title: "Dicas para improvisar em jazz sobre blues",
      type: "TEXT",
      content:
        "Algumas dicas que uso com os meus alunos: começa por dominar a escala de blues, depois experimenta frasear com base em motivos rítmicos simples antes de pensares em notas.",
      authorId: professor.id,
      tags: { create: [{ tagId: byName("jazz").id }, { tagId: byName("iniciante").id }] },
    },
  });

  console.log("Seed completo:", { admin: admin.email, professor: professor.email, aluno: aluno.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
