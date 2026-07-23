# Lucas Rufino Financeiro

Aplicativo web de **controle financeiro pessoal** — registre entradas e saídas
diárias, acompanhe o saldo, controle despesas fixas e veja quanto pode guardar
para bater a meta do mês.

Feito com **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Prisma** (PostgreSQL), **NextAuth** e **Recharts**. Interface minimalista,
responsiva e otimizada para iPhone, com tema claro/escuro e navegação inferior.

## Funcionalidades

- **Dashboard**: saldo atual, entradas, saídas, saldo líquido, disponível para
  guardar, meta mensal, % da meta, gráfico entradas x saídas e despesas fixas.
- **Lançamento diário**: botões rápidos (Entrada, Alimentação, Lazer, Conta
  fixa, Outras despesas) — registra em menos de 10 segundos.
- **Transações**: lista cronológica com filtros por mês, categoria e tipo.
- **Lazer**: gasto do mês, nº de saídas e quanto ainda pode gastar sem
  comprometer a meta.
- **Meta de economia**: cálculo automático de guardado, falta, dias restantes e
  quanto guardar por dia.
- **Relatórios**: entradas por mês, saídas por categoria, evolução do saldo,
  comparação entre meses, guardado por mês e projeção de quando atinge o objetivo.
- **Ajustes**: editar meta e cadastrar despesas fixas.

## Dados iniciais (seed)

- **Usuário**: Lucas Rufino — `lucasrufino@financeiro.app` / senha `12345678`
- **Despesas fixas**: Energia R$ 400, Água R$ 150, IPTU R$ 150, Internet casa
  R$ 100, Internet celular R$ 70, Alimentação R$ 70/dia (× 30 = R$ 2.100/mês).
- **Meta**: R$ 13.333,33/mês (juntar R$ 40.000 em 3 meses).

## Rodando localmente

Suba um Postgres local (uma linha, via Docker):

```bash
docker run --name fin-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Depois:

```bash
cd financeiro
cp .env.example .env          # ajuste DATABASE_URL / NEXTAUTH_SECRET
npm install                   # roda prisma generate no postinstall
npm run db:push               # cria as tabelas
npm run db:seed               # (opcional) cadastra usuário, despesas e meta
npm run dev                   # http://localhost:3000
```

Login: `lucasrufino@financeiro.app` / `12345678`.

> **Não precisa rodar o seed manualmente.** No primeiro login o app popula
> automaticamente o usuário, as despesas fixas e a meta (`ensureSeeded`).
> O `db:seed` continua disponível caso queira popular sem logar.

## Deploy na Vercel

1. Suba este diretório (`financeiro/`) para um repositório e importe na Vercel
   (defina **Root Directory = `financeiro`** se o repo tiver outros arquivos).
2. Crie um Postgres gerenciado — **Vercel Postgres** (Storage → Create), **Neon**
   ou **Supabase** — e copie a connection string.
3. Configure as variáveis de ambiente no projeto da Vercel:
   - `DATABASE_URL` — a connection string do Postgres (com `sslmode=require`).
   - `NEXTAUTH_SECRET` — gere com `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — a URL pública do deploy.
4. O build (`vercel.json`) já roda `prisma generate && prisma db push && next build`,
   então as tabelas são criadas no primeiro deploy.
5. Acesse a URL e faça login — os dados iniciais (usuário, despesas fixas e meta)
   são criados automaticamente. Pronto para uso.

## Modelos (Prisma)

`User`, `Transaction`, `FixedExpense`, `SavingsGoal`. Cada transação tem:
`id, type, amount, category, description, paymentMethod, date, createdAt`.
