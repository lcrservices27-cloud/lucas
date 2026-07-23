import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

let ensured = false;

/**
 * Garante que os dados iniciais existam (usuário, despesas fixas e meta).
 * Idempotente e barato: se o usuário já existe, não faz nada.
 *
 * É chamado no fluxo de login, então em produção (Vercel) o banco é
 * populado automaticamente no primeiro acesso — sem precisar rodar o seed
 * manualmente contra o banco de produção.
 */
export async function ensureSeeded(): Promise<void> {
  // Cache em memória para evitar a query de contagem em toda requisição.
  if (ensured) return;

  const email = "lucasrufino@financeiro.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    ensured = true;
    return;
  }

  const passwordHash = await bcrypt.hash("12345678", 10);
  const user = await prisma.user.create({
    data: { name: "Lucas Rufino", email, password: passwordHash },
  });

  const fixedExpenses = [
    { name: "Energia", amount: 400 },
    { name: "Água", amount: 150 },
    { name: "IPTU", amount: 150 },
    { name: "Internet de casa", amount: 100 },
    { name: "Internet celular", amount: 70 },
    { name: "Alimentação", amount: 70 * 30, perDay: 70, daysBase: 30 },
  ];
  await prisma.fixedExpense.createMany({
    data: fixedExpenses.map((fe) => ({
      userId: user.id,
      name: fe.name,
      amount: fe.amount,
      perDay: fe.perDay ?? null,
      daysBase: fe.daysBase ?? null,
      active: true,
    })),
  });

  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      monthlyTarget: 13333.33,
      totalTarget: 40000,
      months: 3,
      active: true,
    },
  });

  ensured = true;
}
