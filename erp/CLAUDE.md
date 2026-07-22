@AGENTS.md

# Lucas Limpa Nome ERP — Contexto do projeto

ERP SaaS interno completo para a "Lucas Limpa Nome" (empresa de limpeza de
nome / recuperação de crédito). Construído do zero em sessão anterior do
Claude Code (web). Este arquivo é a memória do projeto — leia antes de mexer.

## Estado atual (o que já está PRONTO e testado)

- **Todos os módulos funcionais**: Dashboard (KPIs + 4 gráficos), CRM
  (lista TanStack Table + ficha do cliente com abas), Kanban Comercial
  (drag-and-drop dnd-kit persistido), Financeiro (fluxo de caixa,
  parcelas, pagamentos), Agenda (calendário próprio), Tarefas, Relatórios
  (com export CSV), Usuários (papéis), Configurações (perfil/senha/tema).
  O Kanban Jurídico e o campo `statusJuridico` foram removidos do sistema
  (migração `remove_kanban_juridico`) — o ERP hoje só acompanha a fase
  comercial e financeira do cliente. O papel de usuário "Jurídico" (cargo
  de pessoa, ex. Diego) foi mantido, é conceito diferente.
- **Assistente de voz com IA** (botão flutuante global): Web Speech API
  (STT/TTS) + campo de texto; dois motores em `src/lib/assistant/` —
  `heuristica.ts` (regras, funciona sem chave) e `llm.ts` (Claude tool-use,
  ativa quando `ANTHROPIC_API_KEY` existir; cai para heurística se a API
  falhar). Confirmação antes de criar cliente; histórico persistido em
  `AssistenteInteracao`.
- **Auditoria de segurança feita**: uploads fora de public/ servidos por
  `/api/documentos/[id]` autenticado; rate limit no login; open redirect
  corrigido; `assertUser()/assertAdmin()` em todas as actions de mutação;
  enums validados; AUTH_SECRET obrigatório em produção; página de usuários
  só para admin. Automação de inadimplência em `src/lib/financeiro-sync.ts`
  (chamada nas queries do dashboard/financeiro).
- Build, lint e typecheck limpos. Testado de ponta a ponta com Playwright
  (Chromium do sistema, `executablePath` em `/opt/pw-browsers/...` no
  sandbox; localmente use o Playwright normal).

## Stack e convenções

Next.js 16 App Router (params/searchParams são Promise — sempre `await`),
React 19, Tailwind v4 (CSS-first em `src/app/globals.css`, sem
tailwind.config), shadcn/ui escrito à mão em `src/components/ui/` (o CLI
da shadcn não foi usado), Prisma 7 com driver adapter `@prisma/adapter-pg`
(client gerado em `src/generated/prisma`, singleton em `src/lib/prisma.ts`),
auth própria por cookie JWT (jose) em `src/lib/session.ts` + proxy.ts
(middleware). Todo texto de UI em pt-BR.

Estrutura: `src/lib/queries/*` (leituras), `src/lib/actions/*` (Server
Actions com "use server"), `src/lib/labels.ts` (enum→label pt-BR, fonte
única), `src/components/<modulo>/*`.

### Armadilhas conhecidas (custaram debug — não repita)

1. `Decimal` do Prisma NÃO serializa para Client Component: converta com
   `Number()` na query antes de cruzar a fronteira (ver
   `src/lib/queries/cliente-detail.ts`).
2. Não passe closures de Server Component para Client Component — só
   Server Actions ou dados puros (o Kanban pré-renderiza os cards no
   servidor e passa `{id, status, node}`).
3. O `<Select>` da shadcn não submete `name` em form nativo — use
   `<input type="hidden">` controlado ao lado.
4. `extrairNumero` em `src/lib/assistant/normalize.ts` trata milhar
   brasileiro ("1.200,50") — cuidado ao mexer.
5. eslint com React Compiler: não chame setState direto no corpo de
   useEffect; use `useSyncExternalStore` para "mounted"/suporte de API
   (ver `src/hooks/use-mounted.ts`).

## Ambiente local

```bash
pnpm install
cp .env.example .env   # DATABASE_URL (Postgres local) + AUTH_SECRET
pnpm prisma migrate dev
pnpm db:seed           # cria 5 usuários (senha lucas123) + 60 clientes fake
pnpm dev
```
Login de teste: `lucas@lucaslimpanome.com.br` / `lucas123` (admin).

## PENDENTE — deploy na Vercel (próximo passo)

Workflow pronto em `.github/workflows/deploy-vercel.yml` (raiz do repo):
cada push na branch faz deploy de produção do diretório `erp/`. Falta o
usuário criar 3 secrets no GitHub (Settings → Secrets → Actions):
`VERCEL_TOKEN` (vercel.com/account/tokens), `DATABASE_URL` (Postgres
hospedado, ex. neon.tech) e `AUTH_SECRET` (string aleatória). No primeiro
deploy, rodar o workflow manualmente com input `seed=true` para criar os
usuários (sem isso não há login). Depois verificar logs do Actions e
entregar a URL de produção. Limitações Vercel documentadas no README
(uploads em disco não persistem em serverless → migrar para Vercel Blob
se upload de documentos for usado em produção).

Branch de trabalho: `claude/lucas-limpa-nome-erp-emb4w5` (sem PR aberto).
