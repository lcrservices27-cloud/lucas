# Lucas Rufino Financeiro

Aplicativo web de **controle financeiro pessoal** — registre entradas e saídas
diárias, acompanhe o saldo, controle despesas fixas e veja quanto pode guardar
para bater a meta do mês.

Feito com **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Prisma** (SQLite em dev), **NextAuth** e **Recharts**. Interface minimalista,
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

```bash
cd financeiro
cp .env.example .env          # ajuste NEXTAUTH_SECRET se quiser
npm install                   # roda prisma generate no postinstall
npm run db:push               # cria o banco SQLite
npm run db:seed               # cadastra usuário, despesas fixas e meta
npm run dev                   # http://localhost:3000
```

Login: `lucasrufino@financeiro.app` / `12345678`.

## Deploy na Vercel

1. Suba este diretório (`financeiro/`) para um repositório e importe na Vercel
   (defina **Root Directory = `financeiro`** se o repo tiver outros arquivos).
2. Configure as variáveis de ambiente:
   - `DATABASE_URL` — em produção use um Postgres gerenciado (Neon, Supabase,
     Vercel Postgres) **ou** Turso. SQLite não persiste no filesystem efêmero
     da Vercel.
   - `NEXTAUTH_SECRET` — gere com `openssl rand -base64 32`.
   - `NEXTAUTH_URL` — a URL pública do deploy.
3. Para Postgres, troque no `prisma/schema.prisma`:
   `provider = "postgresql"` e faça `prisma db push`.
4. O build (`vercel.json`) já roda `prisma generate && prisma db push && next build`.
5. Após o primeiro deploy, rode o seed uma vez (localmente apontando o
   `DATABASE_URL` de produção, ou via `vercel env pull` + `npm run db:seed`).

## Modelos (Prisma)

`User`, `Transaction`, `FixedExpense`, `SavingsGoal`. Cada transação tem:
`id, type, amount, category, description, paymentMethod, date, createdAt`.
