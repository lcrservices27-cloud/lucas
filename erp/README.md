# Lucas Limpa Nome — ERP

Sistema operacional interno da Lucas Limpa Nome: CRM (por produto —
Rating Comercial / Limpa Nome), Kanban comercial (Entrada Recebida →
Aguardando Pix → Venda Fechada), financeiro com fluxo de caixa automático,
agenda, relatórios (histórico operacional), gestão de usuários e um
assistente de voz com IA integrado.

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

Uploads de documentos são gravados em `uploads/<clienteId>/` (fora de
`public/`, pois contêm dados sensíveis) e servidos exclusivamente pela rota
autenticada `/api/documentos/[id]`. Uploads têm limite de 10 MB e allowlist
de extensões. Adequado para deploy self-hosted; trocar por um storage
externo em produção multi-instância.

## Assistente de voz com IA

Botão flutuante (canto inferior direito) disponível em todo o sistema.
Reconhecimento e síntese de voz usam a Web Speech API do navegador (grátis,
sem chave — funciona bem em Chrome/Edge; um campo de texto sempre serve como
alternativa). O painel tem duas abas: **Conversa** e **Histórico** (registra
quem falou, quando e qual ação foi executada — `AssistenteInteracao` no
schema).

Suporta cadastro de cliente por etapas (com confirmação antes de salvar),
registrar pagamento, mover cliente no kanban, buscar clientes por filtro,
abrir ficha de cliente, responder perguntas financeiras, criar tarefa +
evento na agenda, e listar processos parados — tudo por comando de voz ou
texto em linguagem natural.

A interpretação de intenção tem dois modos, escolhidos automaticamente:

- **Sem `ANTHROPIC_API_KEY`** (padrão): interpretador por regras
  (`src/lib/assistant/heuristica.ts`), sem custo, cobre os comandos descritos
  acima.
- **Com `ANTHROPIC_API_KEY`** configurada: usa o Claude com tool-use
  (`src/lib/assistant/llm.ts`) para entender linguagem livre, sem exigir
  frases exatas. Gere a chave em console.anthropic.com e defina também
  `ASSISTANT_MODEL` se quiser um modelo diferente do padrão.

Ambos os modos chamam as mesmas ações do sistema (`src/lib/assistant/tools.ts`),
então o comportamento final é idêntico — só muda a flexibilidade de
linguagem aceita.

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
   ex.: `openssl rand -hex 32`). Opcional: `ANTHROPIC_API_KEY` para o
   assistente de voz entender linguagem livre (sem ela, funciona em modo
   básico por regras).
5. Deploy. O `build` script já roda `prisma migrate deploy` antes do
   `next build`, então o schema é aplicado automaticamente a cada deploy.
6. (Opcional) Para popular com dados de exemplo, rode localmente uma vez
   apontando para o banco de produção: `DATABASE_URL="<url-da-vercel>" pnpm db:seed`.

**Limitações conhecidas na Vercel:**

- O upload de documentos grava em disco local (`uploads/`), que não persiste
  entre invocações serverless. Os uploads funcionam durante a requisição mas
  o arquivo pode não estar disponível depois — para produção real na Vercel,
  trocar por um storage externo (Vercel Blob, S3, etc.).
- O rate limit de login é em memória (por instância). Em serverless
  multi-instância a proteção fica parcial — trocar por Redis/Upstash se
  brute force for uma preocupação real.
