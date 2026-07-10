# Pipeline — Lucas AI

Dashboard interno de prospecção da Lucas AI. Substitui o rastreamento manual em `comercial/pipeline.md` por um CRM simples: lista filtrável de imobiliárias-alvo (Hot/Warm/Cold/Skip), edição de status/dados e log de atividades (ligações, WhatsApp, calls).

Uso interno apenas — não é o painel que os clientes (imobiliárias) usariam.

## Stack

- Next.js (App Router), JavaScript
- Postgres via `@neondatabase/serverless` (Vercel Postgres / Neon), SQL parametrizado, sem ORM
- Auth própria mínima: cookie assinado (HMAC), usuário único

## Rodando localmente

```bash
npm install
vercel link                      # conecta este diretório ao projeto na Vercel
vercel env pull .env.local       # baixa DATABASE_URL do storage Postgres do projeto
# preencher ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET em .env.local (ver .env.local.example)

npm run db:init                  # cria as tabelas prospects e prospect_activities
npm run import:prospects         # importa os alvos reais de comercial/alvos-25-reclassificados.md
npm run dev                      # http://localhost:3000
```

## Scripts

- `npm run dev` / `build` / `start` — Next.js
- `npm run db:init` — cria/verifica o schema (idempotente)
- `npm run prospects [hot|warm|cold|skip]` — lista prospects via terminal, sem passar pela API/auth
- `npm run import:prospects` — importação única dos dados reais (idempotente, não duplica por telefone)

## Estrutura

- `app/api/prospects/*` — CRUD de prospects + log de atividades
- `app/api/auth/*` — login/logout/sessão
- `app/dashboard`, `app/login` — UI
- `lib/` — db, auth, validação, constantes (fonte única dos enums de status/score)
- `scripts/` — CLI local e importação de dados
