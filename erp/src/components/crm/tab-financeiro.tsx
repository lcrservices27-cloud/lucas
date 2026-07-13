import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RegistrarPagamentoDialog } from "@/components/crm/registrar-pagamento-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  STATUS_PARCELA_LABEL,
  STATUS_PARCELA_BADGE,
  TIPO_PAGAMENTO_LABEL,
  METODO_PAGAMENTO_LABEL,
  FORMA_PAGAMENTO_LABEL,
} from "@/lib/labels";
import type { ClienteDetail } from "@/lib/queries/cliente-detail";

export function TabFinanceiro({ cliente }: { cliente: ClienteDetail }) {
  const totalPago = cliente.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
  const saldo = Number(cliente.valorContratado) - totalPago;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="py-1">
            <p className="text-xs text-muted-foreground">Valor contratado</p>
            <p className="text-lg font-semibold">{formatCurrency(Number(cliente.valorContratado))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-1">
            <p className="text-xs text-muted-foreground">Total pago</p>
            <p className="text-lg font-semibold text-success">{formatCurrency(totalPago)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-1">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className={`text-lg font-semibold ${saldo > 0 ? "text-warning" : ""}`}>{formatCurrency(saldo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-1">
            <p className="text-xs text-muted-foreground">Forma de pagamento</p>
            <p className="text-lg font-semibold">
              {cliente.formaPagamento ? FORMA_PAGAMENTO_LABEL[cliente.formaPagamento] : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Parcelas</CardTitle>
          <RegistrarPagamentoDialog
            clienteId={cliente.id}
            parcelas={cliente.parcelas.map((p) => ({ id: p.id, numero: p.numero, valor: Number(p.valor), status: p.status }))}
          />
        </CardHeader>
        <CardContent>
          {cliente.parcelas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma parcela cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cliente.parcelas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.numero}</TableCell>
                    <TableCell>{formatCurrency(Number(p.valor))}</TableCell>
                    <TableCell>{formatDate(p.vencimento)}</TableCell>
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
          <CardTitle className="text-sm font-medium">Histórico de pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {cliente.pagamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Registrado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cliente.pagamentos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.dataPagamento)}</TableCell>
                    <TableCell>{TIPO_PAGAMENTO_LABEL[p.tipo]}</TableCell>
                    <TableCell>{METODO_PAGAMENTO_LABEL[p.metodo]}</TableCell>
                    <TableCell>{formatCurrency(Number(p.valor))}</TableCell>
                    <TableCell>{p.registradoPor?.nome ?? "—"}</TableCell>
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
