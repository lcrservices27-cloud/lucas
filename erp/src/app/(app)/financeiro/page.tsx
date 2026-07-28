import { Wallet, CalendarDays, TrendingUp, TrendingDown, Hourglass, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { NovoLancamentoDialog } from "@/components/financeiro/novo-lancamento-dialog";
import { getFinanceiroData } from "@/lib/queries/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PRODUTO_LABEL, METODO_PAGAMENTO_LABEL } from "@/lib/labels";

export default async function FinanceiroPage() {
  const { kpis, fluxo } = await getFinanceiroData();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Fluxo de caixa automático — cada pagamento entra aqui na hora.
          </p>
        </div>
        <NovoLancamentoDialog />
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center justify-between gap-4 py-1">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">💸 Custos Totais</p>
            <p className="mt-1 truncate text-3xl font-semibold tracking-tight tabular-nums text-destructive">
              {formatCurrency(kpis.custosTotais)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Soma de todas as despesas cadastradas.</p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <TrendingDown className="size-5" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Saldo do dia" value={formatCurrency(kpis.saldoDoDia)} icon={CalendarDays} tone={kpis.saldoDoDia >= 0 ? "success" : "destructive"} />
        <KpiCard label="Saldo acumulado" value={formatCurrency(kpis.saldoAcumulado)} icon={Wallet} tone={kpis.saldoAcumulado >= 0 ? "success" : "destructive"} />
        <KpiCard label="Total recebido no mês" value={formatCurrency(kpis.totalRecebidoMes)} icon={TrendingUp} tone="success" />
        <KpiCard label="Total pendente" value={formatCurrency(kpis.totalPendente)} icon={Hourglass} tone="warning" />
        <KpiCard label="Vendas fechadas" value={String(kpis.vendasFechadas)} icon={CheckCircle2} tone="success" />
        <KpiCard label="Clientes aguardando Pix" value={String(kpis.aguardandoPix)} icon={Clock} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Fluxo de caixa</CardTitle>
        </CardHeader>
        <CardContent>
          {fluxo.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum movimento registrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente / descrição</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Saldo acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fluxo.slice(0, 100).map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(f.data)}</TableCell>
                      <TableCell>
                        {f.clienteId ? (
                          <Link href={`/crm/${f.clienteId}`} className="hover:underline">
                            {f.clienteNome}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{f.descricao}</span>
                        )}
                      </TableCell>
                      <TableCell>{f.produto ? PRODUTO_LABEL[f.produto] : "—"}</TableCell>
                      <TableCell>{f.forma ? METODO_PAGAMENTO_LABEL[f.forma] : "—"}</TableCell>
                      <TableCell className={`text-right tabular-nums ${f.tipo === "RECEITA" ? "text-success" : "text-destructive"}`}>
                        {f.tipo === "RECEITA" ? "+" : "-"}
                        {formatCurrency(f.valor)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{formatCurrency(f.saldoAcumulado)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
