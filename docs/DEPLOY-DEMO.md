# Demo separada + Lançamento de produção

Guia para pôr a **demo** (`demo.cadenza.pt`) com a sua própria base de dados e
conteúdo de exemplo, e deixar a **produção** (`cadenza.pt`) limpa para o
lançamento — os utilizadores reais criam o conteúdo.

## Arquitetura

```
cadenza.pt        →  Vercel: projeto "cadenza"        →  Neon: BD de PRODUÇÃO (limpa)
demo.cadenza.pt   →  Vercel: projeto "cadenza-demo"   →  Neon: BD de DEMO (com exemplos)
```

Mesmo código, **dois deploys**, **duas bases de dados**. A separação é feita só
por variáveis de ambiente — não é preciso alterar código.

O código já está preparado:
- `isDemoHost()` reconhece o host `demo.` **ou** `DEMO_MODE=true`.
- `/api/demo-login` (que semeia o exemplo) **só corre no host de demo** — nunca
  repõe conteúdo nem polui a lista de espera em produção.
- `db:reset-and-launch` limpa a produção preservando lista de espera, admins e
  notícias/vagas de admins.

---

## Passo 1 — Base de dados da demo (Neon)

1. Na Neon, cria uma **branch** nova do projeto (ex.: `demo`) ou um **projeto** novo.
2. Copia as duas connection strings:
   - **pooled** (host com `-pooler`) → `DATABASE_URL` (acrescenta `?sslmode=require&pgbouncer=true&connection_limit=1&connect_timeout=15`)
   - **direct** (host sem `-pooler`) → `DIRECT_URL` (`?sslmode=require`)

## Passo 2 — Projeto Vercel da demo

1. Cria um novo projeto Vercel a partir do mesmo repositório/branch (ex.: `cadenza-demo`).
2. Define as variáveis de ambiente (ver tabela abaixo) — **a diferença-chave é
   o `DATABASE_URL`/`DIRECT_URL` (BD da demo) e `DEMO_MODE=true`**.
3. Faz deploy. O build corre `prisma migrate deploy` contra a BD da demo.

## Passo 3 — Semear o conteúdo de exemplo na demo

Aponta para a BD da demo e corre uma vez:

```bash
# com o DATABASE_URL/DIRECT_URL da DEMO no ambiente
npm run db:seed
```

Isto cria os utilizadores, posts, comentários, notícias e vagas de exemplo
(via `ensureDemoSeed`). Alternativa: basta alguém usar o botão de demo — o
`/api/demo-login` semeia na primeira utilização (só no host de demo).

## Passo 4 — Domínio

Aponta `demo.cadenza.pt` para o projeto **cadenza-demo** na Vercel (Domains).

---

## Variáveis de ambiente (demo vs produção)

| Variável | Produção (`cadenza.pt`) | Demo (`demo.cadenza.pt`) |
|---|---|---|
| `DATABASE_URL` | BD de produção (pooled) | **BD da demo** (pooled) |
| `DIRECT_URL` | BD de produção (direct) | **BD da demo** (direct) |
| `AUTH_SECRET` | segredo forte | segredo forte (pode ser outro) |
| `NEXT_PUBLIC_SITE_URL` | `https://cadenza.pt` | `https://demo.cadenza.pt` |
| `DEMO_MODE` | *(não definir)* | `true` |
| `COMING_SOON` | `true` até lançar | *(não definir)* |
| `NEXT_PUBLIC_LAUNCH_DATE` | data de lançamento (opcional) | *(não definir)* |
| `NEXT_PUBLIC_WAITLIST_ENABLED` | conforme a página de espera | *(não definir)* |
| `NEXT_PUBLIC_PREMIUM_ENABLED` | *(não definir — Premium em stand-by)* | *(não definir)* |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | sim (emails reais) | opcional (a demo não precisa de enviar emails) |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | quando ativares o CAPTCHA | opcional |
| `NEXT_PUBLIC_ADSENSE_*`, GA | sim | recomendo **não** definir (sem anúncios/tracking na demo) |
| `CRON_SECRET` | sim (Vercel Cron) | opcional |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | usados pelo reset se não existir admin | usados pelo seed |

> Notas
> - O `AUTH_SECRET` é obrigatório em ambos (NextAuth).
> - Na demo, `DEMO_MODE=true` faz o site inteiro comportar-se como demo (ignora o
>   modo "brevemente" e ativa o `/api/demo-login`).

---

## Passo 5 — Lançar a produção (limpar o conteúdo de exemplo)

**Antes:** faz uma branch/backup da BD de produção na Neon (rede de segurança).

Com o `DATABASE_URL`/`DIRECT_URL` de **produção** no ambiente:

```bash
CONFIRM_LAUNCH_RESET=yes npm run db:reset-and-launch
```

Preserva a lista de espera, os admins e as notícias/vagas de admins; apaga o
resto (posts, comentários, contas de exemplo). No fim confirma:
`✅ Reset concluído. Lista de espera preservada: N inscritos.`

> ⚠️ Corre isto **localmente ou num passo manual** apontando à BD de produção —
> **nunca** no build da Vercel (senão apagava a cada deploy).

## Passo 6 — Abrir o acesso antecipado

1. Painel admin → **Lista de espera** → **Convidar** (envia os links de convite).
2. Quando quiseres abrir a todos, remove/põe `COMING_SOON=false` na produção e
   faz redeploy.

---

## Checklist rápida

- [ ] BD da demo criada na Neon
- [ ] Projeto `cadenza-demo` na Vercel com `DATABASE_URL` da demo + `DEMO_MODE=true`
- [ ] `demo.cadenza.pt` apontado ao projeto da demo
- [ ] `npm run db:seed` corrido contra a BD da demo
- [ ] Backup da BD de produção feito
- [ ] `CONFIRM_LAUNCH_RESET=yes npm run db:reset-and-launch` na produção
- [ ] Lista de espera convidada
- [ ] `COMING_SOON` desligado quando abrir a todos
