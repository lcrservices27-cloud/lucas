import "server-only";
import { prisma } from "@/lib/prisma";

// Automação de inadimplência: marca parcelas PENDENTE já vencidas como
// ATRASADA e promove os clientes afetados para statusFinanceiro=ATRASADO.
// Idempotente e barata (dois UPDATEs indexados), é chamada na carga do
// Dashboard e do Financeiro — as telas que exibem os indicadores de atraso —
// para que os números estejam sempre corretos sem depender de um cron externo.
export async function sincronizarAtrasos() {
  const agora = new Date();

  await prisma.parcela.updateMany({
    where: { status: "PENDENTE", vencimento: { lt: agora } },
    data: { status: "ATRASADA" },
  });

  await prisma.cliente.updateMany({
    where: {
      statusFinanceiro: { notIn: ["PAGO", "CANCELADO", "ATRASADO"] },
      parcelas: { some: { status: "ATRASADA" } },
    },
    data: { statusFinanceiro: "ATRASADO" },
  });
}
