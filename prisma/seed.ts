import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const demoPasswordHash = await bcrypt.hash("demo1234", 10);
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cadenza.app" },
    update: {},
    create: {
      name: "Admin Cadenza",
      email: "admin@cadenza.app",
      passwordHash,
      role: "ADMIN",
      emailVerified: now,
      onboardedAt: now,
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
      bio: "Professora de piano clássico, 15 anos de experiência. Adoro ajudar alunos a perder o medo do palco.",
      instrument: "Piano",
      verificationStatus: "APPROVED",
      emailVerified: now,
      onboardedAt: now,
      points: 340,
      currentStreak: 4,
      longestStreak: 12,
      lastActiveAt: now,
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
      instrument: "Saxofone",
      emailVerified: now,
      onboardedAt: now,
      points: 85,
      currentStreak: 2,
      longestStreak: 6,
      lastActiveAt: now,
    },
  });

  const mariana = await prisma.user.upsert({
    where: { email: "mariana@cadenza.app" },
    update: {},
    create: {
      name: "Mariana Ferreira",
      email: "mariana@cadenza.app",
      passwordHash,
      role: "MUSICO_PROFISSIONAL",
      bio: "Violinista na Orquestra Sinfónica Metropolitana. Aberta a dar dicas de técnica e postura.",
      instrument: "Violino",
      verificationStatus: "APPROVED",
      emailVerified: now,
      onboardedAt: now,
      points: 510,
      currentStreak: 9,
      longestStreak: 31,
      lastActiveAt: now,
    },
  });

  const tiago = await prisma.user.upsert({
    where: { email: "tiago@cadenza.app" },
    update: {},
    create: {
      name: "Tiago Rocha",
      email: "tiago@cadenza.app",
      passwordHash,
      role: "ALUNO",
      bio: "Guitarrista autodidata, à procura de banda.",
      instrument: "Guitarra elétrica",
      emailVerified: now,
      onboardedAt: now,
      points: 40,
      currentStreak: 1,
      longestStreak: 3,
      lastActiveAt: now,
    },
  });

  const sofia = await prisma.user.upsert({
    where: { email: "sofia@cadenza.app" },
    update: {},
    create: {
      name: "Sofia Marques",
      email: "sofia@cadenza.app",
      passwordHash,
      role: "PROFESSOR",
      bio: "Professora de canto e técnica vocal. Especialista em jazz e soul.",
      instrument: "Voz",
      verificationStatus: "APPROVED",
      emailVerified: now,
      onboardedAt: now,
      points: 220,
      currentStreak: 3,
      longestStreak: 15,
      lastActiveAt: now,
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@cadenza.app" },
    update: {},
    create: {
      name: "Conta Demo",
      email: "demo@cadenza.app",
      passwordHash: demoPasswordHash,
      role: "ALUNO",
      bio: "Esta é uma conta de demonstração da Cadenza — explora à vontade!",
      instrument: "Piano",
      emailVerified: now,
      onboardedAt: now,
      points: 65,
      currentStreak: 5,
      longestStreak: 8,
      lastActiveAt: now,
    },
  });

  const tagDefs: { name: string; category: "INSTRUMENT" | "GENRE" | "LEVEL" | "OTHER" }[] = [
    { name: "piano", category: "INSTRUMENT" },
    { name: "saxofone", category: "INSTRUMENT" },
    { name: "trompete", category: "INSTRUMENT" },
    { name: "violino", category: "INSTRUMENT" },
    { name: "guitarra", category: "INSTRUMENT" },
    { name: "bateria", category: "INSTRUMENT" },
    { name: "voz", category: "INSTRUMENT" },
    { name: "jazz", category: "GENRE" },
    { name: "clássica", category: "GENRE" },
    { name: "pop", category: "GENRE" },
    { name: "rock", category: "GENRE" },
    { name: "fado", category: "GENRE" },
    { name: "iniciante", category: "LEVEL" },
    { name: "intermédio", category: "LEVEL" },
    { name: "avançado", category: "LEVEL" },
  ];
  const tags = await Promise.all(
    tagDefs.map(({ name, category }) =>
      prisma.tag.upsert({
        where: { name },
        update: { category },
        create: { name, category },
      })
    )
  );
  const byName = (n: string) => tags.find((t) => t.name === n)!;

  await prisma.tagFollow.createMany({
    data: [
      { userId: demo.id, tagId: byName("piano").id },
      { userId: demo.id, tagId: byName("jazz").id },
      { userId: demo.id, tagId: byName("iniciante").id },
    ],
    skipDuplicates: true,
  });

  const post1 = await prisma.post.upsert({
    where: { id: "seed-post-1" },
    update: {},
    create: {
      id: "seed-post-1",
      title: "A minha primeira interpretação de Nocturne de Chopin",
      type: "VIDEO",
      videoUrl: "https://www.youtube.com/watch?v=9E6b3swbnWg",
      authorId: aluno.id,
      pinned: true,
      views: 142,
      createdAt: daysAgo(9),
      tags: {
        create: [{ tagId: byName("piano").id }, { tagId: byName("clássica").id }],
      },
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: "seed-post-2" },
    update: {},
    create: {
      id: "seed-post-2",
      title: "Dicas para improvisar em jazz sobre blues",
      type: "TEXT",
      content:
        "Algumas dicas que uso com os meus alunos: começa por dominar a escala de blues, depois experimenta frasear com base em motivos rítmicos simples antes de pensares em notas.",
      authorId: professor.id,
      views: 88,
      createdAt: daysAgo(7),
      tags: { create: [{ tagId: byName("jazz").id }, { tagId: byName("iniciante").id }] },
    },
  });

  const post3 = await prisma.post.upsert({
    where: { id: "seed-post-3" },
    update: {},
    create: {
      id: "seed-post-3",
      title: "Como melhorar a articulação no saxofone?",
      type: "TEXT",
      content:
        "Sinto que as minhas notas ficam todas coladas quando toco rápido. Alguém tem exercícios que ajudem a separar melhor as notas com a língua?",
      authorId: aluno.id,
      views: 63,
      createdAt: daysAgo(6),
      tags: { create: [{ tagId: byName("saxofone").id }, { tagId: byName("iniciante").id }] },
    },
  });

  const post4 = await prisma.post.upsert({
    where: { id: "seed-post-4" },
    update: {},
    create: {
      id: "seed-post-4",
      title: "Postura correta ao tocar violino — o que aprendi na orquestra",
      type: "TEXT",
      content:
        "Depois de anos com dores no ombro, mudei a forma como seguro o violino. Partilho aqui o que resolveu o meu problema, com fotos da posição correta do queixo e do braço esquerdo.",
      authorId: mariana.id,
      views: 201,
      createdAt: daysAgo(5),
      tags: { create: [{ tagId: byName("violino").id }, { tagId: byName("clássica").id }] },
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-5" },
    update: {},
    create: {
      id: "seed-post-5",
      title: "Procuro banda de rock/pop em Lisboa",
      type: "TEXT",
      content:
        "Toco guitarra elétrica há 3 anos, influências de rock alternativo e pop rock. Já toquei ao vivo algumas vezes. Alguém à procura de guitarrista?",
      authorId: tiago.id,
      views: 47,
      createdAt: daysAgo(4),
      tags: { create: [{ tagId: byName("guitarra").id }, { tagId: byName("rock").id }] },
    },
  });

  const post6 = await prisma.post.upsert({
    where: { id: "seed-post-6" },
    update: {},
    create: {
      id: "seed-post-6",
      title: "Aquecimento vocal em 5 minutos antes de um concerto",
      type: "VIDEO",
      videoUrl: "https://www.youtube.com/watch?v=8OxaJfTNKW8",
      authorId: sofia.id,
      views: 176,
      createdAt: daysAgo(3),
      tags: { create: [{ tagId: byName("voz").id }, { tagId: byName("jazz").id }] },
    },
  });

  const post7 = await prisma.post.upsert({
    where: { id: "seed-post-7" },
    update: {},
    create: {
      id: "seed-post-7",
      title: "Consegui finalmente tocar Autumn Leaves de cor!",
      type: "TEXT",
      content:
        "Depois de semanas a decorar os acordes e a estrutura, já consigo tocar sem partitura. Alguma sugestão de próximo standard de jazz para aprender?",
      authorId: demo.id,
      views: 34,
      createdAt: daysAgo(2),
      tags: { create: [{ tagId: byName("piano").id }, { tagId: byName("jazz").id }] },
    },
  });

  await prisma.post.upsert({
    where: { id: "seed-post-8" },
    update: {},
    create: {
      id: "seed-post-8",
      title: "Recomendações de metrónomos e apps de prática",
      type: "TEXT",
      content:
        "Que apps ou metrónomos físicos costumam usar para praticar ritmo? Estou a começar a bateria e quero criar um bom hábito desde cedo.",
      authorId: tiago.id,
      views: 29,
      createdAt: daysAgo(1),
      tags: { create: [{ tagId: byName("bateria").id }, { tagId: byName("iniciante").id }] },
    },
  });

  const comment1 = await prisma.comment.upsert({
    where: { id: "seed-comment-1" },
    update: {},
    create: {
      id: "seed-comment-1",
      postId: post3.id,
      authorId: professor.id,
      content:
        "Experimenta articulação com a sílaba \"tu\" para cada nota, começando devagar num metrónomo e só acelerando quando estiver limpo. Funciona muito bem com os meus alunos de sopro.",
      createdAt: daysAgo(6),
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-2" },
    update: {},
    create: {
      id: "seed-comment-2",
      postId: post3.id,
      authorId: mariana.id,
      content: "Ótima dica da Maria! Eu também recomendo gravares-te a tocar para ouvires onde as notas ainda colam.",
      createdAt: daysAgo(5),
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-3" },
    update: {},
    create: {
      id: "seed-comment-3",
      postId: post3.id,
      authorId: aluno.id,
      parentId: comment1.id,
      content: "Vou experimentar já hoje, obrigado!",
      createdAt: daysAgo(5),
    },
  });

  await prisma.post.update({
    where: { id: post3.id },
    data: { bestAnswerId: comment1.id },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-4" },
    update: {},
    create: {
      id: "seed-comment-4",
      postId: post1.id,
      authorId: professor.id,
      content: "Parabéns pela interpretação! O rubato na secção B está muito natural.",
      createdAt: daysAgo(8),
    },
  });

  await prisma.comment.upsert({
    where: { id: "seed-comment-5" },
    update: {},
    create: {
      id: "seed-comment-5",
      postId: post7.id,
      authorId: sofia.id,
      content: "Grande conquista! Sugiro \"Fly Me to the Moon\" a seguir, é um bom próximo passo.",
      createdAt: daysAgo(1),
    },
  });

  const voteRows: { postId: string; userId: string; value: "UP" | "DOWN" }[] = [
    { postId: post1.id, userId: professor.id, value: "UP" },
    { postId: post1.id, userId: mariana.id, value: "UP" },
    { postId: post1.id, userId: sofia.id, value: "UP" },
    { postId: post2.id, userId: aluno.id, value: "UP" },
    { postId: post2.id, userId: tiago.id, value: "UP" },
    { postId: post3.id, userId: professor.id, value: "UP" },
    { postId: post3.id, userId: mariana.id, value: "UP" },
    { postId: post4.id, userId: aluno.id, value: "UP" },
    { postId: post4.id, userId: demo.id, value: "UP" },
    { postId: post4.id, userId: tiago.id, value: "UP" },
    { postId: post6.id, userId: aluno.id, value: "UP" },
    { postId: post6.id, userId: demo.id, value: "UP" },
    { postId: post7.id, userId: professor.id, value: "UP" },
  ];
  for (const vote of voteRows) {
    await prisma.postVote.upsert({
      where: { postId_userId: { postId: vote.postId, userId: vote.userId } },
      update: { value: vote.value },
      create: vote,
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        type: "COMMENT",
        userId: demo.id,
        fromUserId: sofia.id,
        postId: post7.id,
        commentId: "seed-comment-5",
      },
      {
        type: "REPLY",
        userId: professor.id,
        fromUserId: aluno.id,
        postId: post3.id,
        commentId: "seed-comment-3",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.waitlistSignup.createMany({
    data: [
      { email: "curioso1@example.com", instrument: "Piano" },
      { email: "curioso2@example.com", instrument: "Bateria" },
      { email: "curioso3@example.com", instrument: "Voz" },
      { email: "curioso4@example.com", instrument: null },
    ],
    skipDuplicates: true,
  });

  await prisma.newsArticle.createMany({
    data: [
      {
        title: "Festival de Jazz de Lisboa anuncia programação para 2026",
        summary:
          "Nomes nacionais e internacionais sobem ao palco em julho, com bilhetes já à venda para os concertos principais.",
        source: "Cadenza",
        createdById: admin.id,
      },
      {
        title: "Conservatório Nacional abre candidaturas para bolsas de mérito",
        summary:
          "Alunos de instrumento e canto podem candidatar-se até ao final do mês a bolsas parciais e totais para o próximo ano letivo.",
        source: "Cadenza",
        createdById: admin.id,
      },
      {
        title: "Estudo relaciona prática diária de 20 minutos com progressão mais rápida",
        summary:
          "Investigadores acompanharam 200 alunos de instrumento durante um ano letivo e associaram sessões curtas e diárias a melhores resultados do que sessões longas e esporádicas.",
        source: "Cadenza",
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.jobListing.createMany({
    data: [
      {
        title: "Violinista (tutti) — lugar efetivo",
        organization: "Orquestra Sinfónica Metropolitana",
        location: "Lisboa",
        type: "ORQUESTRA",
        instrument: "Violino",
        description:
          "Procuramos violinista para o naipe de segundos violinos, com disponibilidade para ensaios semanais e digressões pontuais. Provas em setembro.",
        contactEmail: "recrutamento@osm-exemplo.pt",
        featured: true,
        createdById: admin.id,
      },
      {
        title: "Clarinetista para banda filarmónica",
        organization: "Banda Filarmónica de Santo António",
        location: "Braga",
        type: "BANDA_FILARMONICA",
        instrument: "Clarinete",
        description:
          "Banda com mais de 100 anos de história procura clarinetista para reforçar o naipe de madeiras. Ensaios às quartas e sábados.",
        contactEmail: "geral@bandasantoantonio-exemplo.pt",
        createdById: admin.id,
      },
      {
        title: "Pianista de acompanhamento para combo de jazz",
        organization: "Jazz Clube do Porto",
        location: "Porto",
        type: "JAZZ",
        instrument: "Piano",
        description:
          "Combo residente procura pianista com experiência em standards de jazz para sessões semanais e eventuais concertos ao vivo.",
        applyUrl: "https://example.com/jazz-clube-vaga",
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completo:", {
    admin: admin.email,
    professor: professor.email,
    aluno: aluno.email,
    mariana: mariana.email,
    tiago: tiago.email,
    sofia: sofia.email,
    demo: `${demo.email} / demo1234`,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
