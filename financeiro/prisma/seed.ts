import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "lucasrufino@financeiro.app";
  const password = "12345678";
  const passwordHash = await bcrypt.hash(password, 10);

  // Usuário inicial (idempotente).
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "Lucas Rufino", password: passwordHash },
    create: {
      name: "Lucas Rufino",
      email,
      password: passwordHash,
    },
  });

  console.log(`Usuário: ${user.email}`);

  // Despesas fixas pré-cadastradas.
  const fixedExpenses = [
    { name: "Energia", amount: 400 },
    { name: "Água", amount: 150 },
    { name: "IPTU", amount: 150 },
    { name: "Internet de casa", amount: 100 },
    { name: "Internet celular", amount: 70 },
    // Alimentação: R$ 70/dia x 30 dias = R$ 2.100/mês
    { name: "Alimentação", amount: 70 * 30, perDay: 70, daysBase: 30 },
  ];

  // Recria as despesas fixas do usuário para garantir consistência do seed.
  await prisma.fixedExpense.deleteMany({ where: { userId: user.id } });
  for (const fe of fixedExpenses) {
    await prisma.fixedExpense.create({
      data: {
        userId: user.id,
        name: fe.name,
        amount: fe.amount,
        perDay: fe.perDay ?? null,
        daysBase: fe.daysBase ?? null,
        active: true,
      },
    });
  }
  const totalFixed = fixedExpenses.reduce((s, e) => s + e.amount, 0);
  console.log(`Despesas fixas cadastradas: ${fixedExpenses.length} (total R$ ${totalFixed.toFixed(2)}/mês)`);

  // Meta de economia: R$ 13.333,33/mês para juntar R$ 40.000 em 3 meses.
  const existingGoal = await prisma.savingsGoal.findFirst({
    where: { userId: user.id, active: true },
  });
  if (!existingGoal) {
    await prisma.savingsGoal.create({
      data: {
        userId: user.id,
        monthlyTarget: 13333.33,
        totalTarget: 40000,
        months: 3,
        active: true,
      },
    });
    console.log("Meta de economia criada: R$ 13.333,33/mês (R$ 40.000 em 3 meses)");
  } else {
    console.log("Meta de economia já existe — mantida.");
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
