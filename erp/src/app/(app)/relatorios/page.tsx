import Link from "next/link";
import { Users, Percent, Wallet, Hourglass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ReceitaMensalChart } from "@/components/dashboard/charts";
import { ExportCsvButton } from "@/components/relatorios/export-csv-button";
import { getRelatoriosData } from "@/lib/queries/relatorios";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TIPO_PAGAMENTO_LABEL, METODO_PAGAMENTO_LABEL } from "@/lib/labels";

export default async function RelatoriosPage() {
  const { clientes, financeiro, pagamentos } = await getRelatoriosData();

  const cidadeRows = clientes.porCidade.map((c) => ({
    Cidade: c.cidade,
    Clientes: c.count,
  }));

  const responsavelRows = clientes.porResponsavel.map((r) => ({
    Responsavel: r.nome,
    Quantidade: r.count,
    ValorTotalContratado: r.total,
  }));

  const pagamentosRows = pagamentos.map((p) => ({
    Cliente: p.clienteNome,
    Tipo: TIPO_PAGAMENTO_LABEL[p.tipo] ?? p.tipo,
    Metodo: METODO_PAGAMENTO_LABEL[p.metodo] ?? p.metodo,
    Valor: p.valor,
    Data: formatDate(p.dataPagamento),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Análises consolidadas de clientes, financeiro e pagamentos.
        </p>
      </div>

      <Tabs defaultValue="clientes">
        <TabsList>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Total de clientes" value={String(clientes.total)} icon={Users} />
            <KpiCard
              label="Conversão de vendas"
              value={`${clientes.conversao.toFixed(1)}%`}
              icon={Percent}
              tone="success"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="text-sm font-medium">Clientes por cidade (top 10)</CardTitle>
                <ExportCsvButton filename="relatorio-clientes-por-cidade.csv" rows={cidadeRows} />
              </CardHeader>
              <CardContent>
                {clientes.porCidade.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Clientes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientes.porCidade.map((c) => (
                        <TableRow key={c.cidade}>
                          <TableCell>{c.cidade}</TableCell>
                          <TableCell>{c.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="text-sm font-medium">Clientes por responsável</CardTitle>
                <ExportCsvButton filename="relatorio-clientes-por-responsavel.csv" rows={responsavelRows} />
              </CardHeader>
              <CardContent>
                {clientes.porResponsavel.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor contratado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientes.porResponsavel.map((r) => (
                        <TableRow key={r.nome}>
                          <TableCell>{r.nome}</TableCell>
                          <TableCell>{r.count}</TableCell>
                          <TableCell>{formatCurrency(r.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Receita total"
              value={formatCurrency(financeiro.totalReceita)}
              icon={Wallet}
              tone="success"
            />
            <KpiCard
              label="Total a receber"
              value={formatCurrency(financeiro.totalAReceber)}
              icon={Hourglass}
              tone="warning"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Receita mensal (últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ReceitaMensalChart data={financeiro.receitaMensal} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-sm font-medium">Últimos pagamentos</CardTitle>
              <ExportCsvButton filename="relatorio-pagamentos.csv" rows={pagamentosRows} />
            </CardHeader>
            <CardContent>
              {pagamentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagamentos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link href={`/crm/${p.clienteId}`} className="hover:underline">
                            {p.clienteNome}
                          </Link>
                        </TableCell>
                        <TableCell>{TIPO_PAGAMENTO_LABEL[p.tipo] ?? p.tipo}</TableCell>
                        <TableCell>{METODO_PAGAMENTO_LABEL[p.metodo] ?? p.metodo}</TableCell>
                        <TableCell>{formatCurrency(p.valor)}</TableCell>
                        <TableCell>{formatDate(p.dataPagamento)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
