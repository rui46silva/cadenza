# Cadenza

Plataforma para músicos de clássica, jazz e pop partilharem o seu trabalho,
receberem feedback e ajudarem-se mutuamente a crescer.

## MVP atual

- **Fórum** estilo Reddit: posts em texto ou vídeo, tags por instrumento/género,
  comentários (com respostas), votação a favor/contra.
- **Autenticação com 3 roles**: `ADMIN`, `PROFESSOR`, `ALUNO`.
- Schema da base de dados já pensado para crescer (ver "Próximos passos").

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- NextAuth v5 (Credentials, sessão JWT)

## Como correr localmente

```bash
npm install
cp .env.example .env   # ajusta DATABASE_URL e AUTH_SECRET
npx prisma migrate dev
npm run db:seed         # cria utilizadores de teste e posts de exemplo
npm run dev
```

Utilizadores de teste criados pelo seed (password: `password123`):

| Role      | Email                  |
|-----------|------------------------|
| Admin     | admin@cadenza.app      |
| Professor | professor@cadenza.app  |
| Aluno     | aluno@cadenza.app      |

## Estrutura

```
prisma/schema.prisma     modelos: User, Tag, Post, Comment, Votes
src/app/                 páginas e rotas de API (App Router)
src/lib/auth.ts          configuração do NextAuth
src/lib/prisma.ts        cliente Prisma partilhado
src/components/          componentes client (forms, votos, navbar)
```

## Próximos passos sugeridos

A ideia original também incluía uma parte de e-learning gamificado. Sugestão
de evolução, apoiada no schema atual:

1. **Módulos & Aulas** — `Course` (criado por `PROFESSOR`) → `Module` → `Lesson`
   (texto/vídeo). Os alunos têm progresso por módulo (`Enrollment`,
   `ModuleProgress`).
2. **Provas em vídeo** — um `Submission` por módulo, o aluno envia um vídeo,
   o professor avalia (aprovado/repetir) antes de desbloquear o módulo seguinte.
3. **Gamification** — `XP` por ações (postar, comentar útil, completar módulo),
   `Badge`s desbloqueados por marcos, e um leaderboard semanal/mensal.
4. **Moderação** — reports em posts/comentários, e um painel de `ADMIN` para
   gerir utilizadores, tags e conteúdo denunciado.
5. **Perfis de músico** — página de perfil pública com instrumentos, posts,
   módulos concluídos e badges — funciona como "portefólio".

Estas funcionalidades não foram implementadas nesta primeira versão para manter
o MVP focado e validável, mas o modelo de dados foi pensado para que sejam
extensões naturais (mais tabelas, sem reescrever o que já existe).
