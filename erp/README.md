# Lucas Limpa Nome — ERP

Sistema operacional interno da Lucas Limpa Nome: CRM, Kanban comercial e
jurídico, financeiro, agenda, tarefas, relatórios e gestão de usuários.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Prisma 7 (driver adapters) · PostgreSQL · TanStack Table/Query · React Hook
Form + Zod · dnd-kit · Recharts · Framer Motion.

## Setup

```bash
pnpm install
cp .env.example .env   # ajuste DATABASE_URL e AUTH_SECRET
pnpm prisma migrate dev
pnpm db:seed
pnpm dev
```

Acesse `http://localhost:3000` — você será redirecionado para `/login`.

### Usuários de teste (seed)

Todos com a senha `lucas123`:

- `lucas@lucaslimpanome.com.br` — Administrador
- `marina@lucaslimpanome.com.br` — Financeiro
- `rafael@lucaslimpanome.com.br` — Atendimento
- `bianca@lucaslimpanome.com.br` — Consultor
- `diego@lucaslimpanome.com.br` — Jurídico

## Scripts

- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` / `pnpm start` — build e servidor de produção
- `pnpm lint` — ESLint
- `pnpm db:seed` — repopula o banco com dados de exemplo
- `pnpm db:studio` — Prisma Studio

## Estrutura

- `prisma/schema.prisma` — modelo de dados completo (clientes, financeiro,
  documentos, timeline, tarefas, agenda, usuários)
- `src/app/(app)/*` — módulos do sistema (rotas protegidas por sessão)
- `src/app/login` — autenticação
- `src/lib/queries/*` — leitura de dados (Server Components)
- `src/lib/actions/*` — mutações (Server Actions)
- `src/components/ui/*` — primitivos shadcn/ui
- `src/components/<modulo>/*` — componentes específicos de cada módulo

Uploads de documentos são gravados em `public/uploads/<clienteId>/` (disco
local — adequado para deploy self-hosted; trocar por um storage externo em
produção multi-instância).

## Deploy na Vercel

O app fica na pasta `erp/` deste repositório, não na raiz — isso precisa ser
configurado manualmente ao importar o projeto.

1. **vercel.com/new** → importe este repositório GitHub.
2. Em **Root Directory**, selecione `erp` (obrigatório — sem isso o build
   falha, pois a raiz do repo não tem o projeto Next.js).
3. Crie um Postgres gerenciado (aba **Storage** do projeto na Vercel →
   Neon/Vercel Postgres, ambos têm free tier) e conecte ao projeto — isso
   preenche `DATABASE_URL` automaticamente nas Environment Variables.
4. Adicione manualmente a variável `AUTH_SECRET` (uma string aleatória longa,
   ex.: `openssl rand -hex 32`).
5. Deploy. O `build` script já roda `prisma migrate deploy` antes do
   `next build`, então o schema é aplicado automaticamente a cada deploy.
6. (Opcional) Para popular com dados de exemplo, rode localmente uma vez
   apontando para o banco de produção: `DATABASE_URL="<url-da-vercel>" pnpm db:seed`.

**Limitação conhecida:** o upload de documentos grava em disco local
(`public/uploads`), que não persiste entre invocações serverless na Vercel.
Os uploads funcionam durante a requisição mas o arquivo pode não estar
disponível depois — para produção real na Vercel, trocar por um storage
externo (Vercel Blob, S3, etc.).
