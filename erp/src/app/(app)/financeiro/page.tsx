import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, Hourglass, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { NovoLancamentoDialog } from "@/components/financeiro/novo-lancamento-dialog";
import { getFinanceiroData } from "@/lib/queries/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_PARCELA_BADGE, STATUS_PARCELA_LABEL, METODO_PAGAMENTO_LABEL, TIPO_PAGAMENTO_LABEL } from "@/lib/labels";

export default async function FinanceiroPage() {
  const { kpis, lancamentos, parcelasEmAberto, pagamentosRecentes } = await getFinanceiroData();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Fluxo de caixa, contas a receber e histórico de pagamentos.</p>
        </div>
        <NovoLancamentoDialog />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Receitas (mês)" value={formatCurrency(kpis.receitasMes)} icon={TrendingUp} tone="success" />
        <KpiCard label="Despesas (mês)" value={formatCurrency(kpis.despesasMes)} icon={TrendingDown} tone="destructive" />
        <KpiCard label="Lucro (mês)" value={formatCurrency(kpis.lucroMes)} icon={Wallet} />
        <KpiCard label="Contas a receber" value={formatCurrency(kpis.contasAReceber)} icon={Hourglass} tone="warning" />
        <KpiCard label="Receitas (ano)" value={formatCurrency(kpis.receitasAno)} icon={TrendingUp} />
        <KpiCard label="Despesas (ano)" value={formatCurrency(kpis.despesasAno)} icon={TrendingDown} />
        <KpiCard label="Saldo acumulado" value={formatCurrency(kpis.saldo)} icon={PiggyBank} tone={kpis.saldo >= 0 ? "success" : "destructive"} />
        <KpiCard label="Total já quitado em parcelas" value={formatCurrency(kpis.totalParcelasPagas)} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contas a receber</CardTitle>
          </CardHeader>
          <CardContent>
            {parcelasEmAberto.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma parcela em aberto.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelasEmAberto.slice(0, 15).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link href={`/crm/${p.cliente.id}`} className="hover:underline">
                          {p.cliente.nome}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(p.vencimento)}</TableCell>
                      <TableCell>{formatCurrency(p.valor)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_PARCELA_BADGE[p.status]}>{STATUS_PARCELA_LABEL[p.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Últimos pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {pagamentosRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosRecentes.slice(0, 15).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link href={`/crm/${p.cliente.id}`} className="hover:underline">
                          {p.cliente.nome}
                        </Link>
                      </TableCell>
                      <TableCell>{TIPO_PAGAMENTO_LABEL[p.tipo]}</TableCell>
                      <TableCell>{METODO_PAGAMENTO_LABEL[p.metodo]}</TableCell>
                      <TableCell>{formatCurrency(p.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Lançamentos (fluxo de caixa)</CardTitle>
        </CardHeader>
        <CardContent>
          {lancamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento registrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentos.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{formatDate(l.data)}</TableCell>
                    <TableCell>
                      <Badge variant={l.tipo === "RECEITA" ? "success" : "destructive"}>
                        {l.tipo === "RECEITA" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>{l.categoria}</TableCell>
                    <TableCell className="text-muted-foreground">{l.descricao}</TableCell>
                    <TableCell className={l.tipo === "RECEITA" ? "text-success" : "text-destructive"}>
                      {l.tipo === "RECEITA" ? "+" : "-"}
                      {formatCurrency(l.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
