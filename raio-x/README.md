# Raio-X do Crédito

Funil de captação (lead magnet) para tráfego pago no Facebook e Instagram. O
usuário responde um diagnóstico financeiro de ~2 minutos, recebe um **Índice de
Saúde Financeira** (0–100) com um velocímetro e insights parciais, e é
convidado a desbloquear a **Consulta Completa SCR/Basen** via WhatsApp.

É o topo do funil que alimenta o pipeline comercial (prospecção → diagnóstico →
proposta) da Lucas Limpa Nome.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Lucide · Prisma 7 (driver adapter) · PostgreSQL/Supabase ·
autenticação de admin via cookie JWT (jose).

## Fluxo

`/` landing → `/diagnostico` (8 etapas + processamento 8s) → `/resultado/[id]`
(velocímetro, insights, área bloqueada, modal → WhatsApp). Painel em `/admin`.

## Princípios (compliance)

O produto foi construído para **gerar confiança sem enganar**:

- O índice é uma **estimativa a partir das respostas do próprio usuário** —
  a UI deixa isso explícito e **não** é uma consulta a bureaus/Banco Central.
- Os cards da área bloqueada ficam **genuinamente vazios/bloqueados** — nenhum
  dado bancário falso é exibido como real.
- Nenhum texto promete aprovação de crédito, aumento de score ou obtenção de
  empréstimo. Consentimento (LGPD) na etapa final e aviso no rodapé.

## Setup local

```bash
pnpm install
cp .env.example .env     # ajuste as variáveis
pnpm prisma migrate dev
pnpm dev
```

Acesse `http://localhost:3000`. Admin em `/admin/login` (senha em `ADMIN_SENHA`).

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Postgres (em produção, a connection string do Supabase) |
| `ADMIN_SECRET` | segredo para assinar o cookie do admin (`openssl rand -hex 32`) |
| `ADMIN_SENHA` | senha de acesso ao painel |
| `NEXT_PUBLIC_WHATSAPP_NUMERO` | número que recebe os leads (só dígitos, com DDI 55) |
| `NEXT_PUBLIC_SITE_URL` | URL pública (SEO/metadados) |

## Atribuição de tráfego

Os anúncios devem levar à landing com UTM, ex.:
`https://seu-dominio.com.br/?utm_source=facebook&utm_medium=cpc&utm_campaign=raiox-frio`
Os UTMs são capturados no primeiro acesso (sessionStorage, first-touch) e
gravados no diagnóstico — aparecem em "Origem do tráfego" no admin e no CSV.

## Deploy (Vercel + Supabase)

1. **supabase.com** → crie um projeto → copie a **connection string** (Postgres).
2. **vercel.com/new** → importe o repositório; em **Root Directory** selecione
   `raio-x`.
3. Configure as variáveis de ambiente (tabela acima). O `build` já roda
   `prisma migrate deploy` antes do `next build`, então o schema é aplicado a
   cada deploy.
4. Deploy. Aponte os anúncios para o domínio com os UTMs.

## Meta

O objetivo do funil não é vender na hora, e sim gerar confiança e curiosidade
para o usuário desejar a Consulta Completa — o CTA verde abre o WhatsApp já com
nome, CPF mascarado, índice e protocolo preenchidos.
