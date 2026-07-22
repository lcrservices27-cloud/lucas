"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportCsvButton } from "@/components/relatorios/export-csv-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PRODUTO_LABEL,
  PRODUTO_ORDER,
  STATUS_COMERCIAL_LABEL,
  STATUS_COMERCIAL_ORDER,
  FORMA_PAGAMENTO_LABEL,
} from "@/lib/labels";
import type { RelatorioLinha } from "@/lib/queries/relatorios";

const STATUS_FILTRO = [...STATUS_COMERCIAL_ORDER, "CANCELADO"];

export function RelatorioOperacional({ linhas }: { linhas: RelatorioLinha[] }) {
  const [busca, setBusca] = React.useState("");
  const [produto, setProduto] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [de, setDe] = React.useState("");
  const [ate, setAte] = React.useState("");

  const filtradas = React.useMemo(() => {
    const q = busca.trim().toLowerCase();
    return linhas.filter((l) => {
      if (q && !(l.nome.toLowerCase().includes(q) || (l.cpf ?? "").toLowerCase().includes(q))) return false;
      if (produto !== "all" && l.produto !== produto) return false;
      if (status !== "all" && l.statusComercial !== status) return false;
      const dataEntrada = l.dataEntrada.slice(0, 10);
      if (de && dataEntrada < de) return false;
      if (ate && dataEntrada > ate) return false;
      return true;
    });
  }, [linhas, busca, produto, status, de, ate]);

  const csvRows = filtradas.map((l) => ({
    Nome: l.nome,
    CPF: l.cpf ?? "",
    Produto: l.produto ? PRODUTO_LABEL[l.produto] : "",
    DataEntrada: formatDate(l.dataEntrada),
    ValorTotal: l.valorTotal,
    ValorPago: l.valorPago,
    ValorRestante: l.valorRestante,
    FormaPagamento: l.formaPagamento ? FORMA_PAGAMENTO_LABEL[l.formaPagamento] : "",
    Status: STATUS_COMERCIAL_LABEL[l.statusComercial] ?? l.statusComercial,
    Pagamentos: l.datasPagamentos.map((d) => formatDate(d)).join(" / "),
    DataConclusao: l.dataConclusao ? formatDate(l.dataConclusao) : "",
    Observacoes: l.observacoes,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Label className="text-xs text-muted-foreground">Cliente / CPF</Label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Produto</Label>
          <Select value={produto} onValueChange={setProduto}>
            <SelectTrigger className="mt-1 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {PRODUTO_ORDER.map((p) => (
                <SelectItem key={p} value={p}>{PRODUTO_LABEL[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-1 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {STATUS_FILTRO.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_COMERCIAL_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Entrada de</Label>
          <Input type="date" className="mt-1 w-[150px]" value={de} onChange={(e) => setDe(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">até</Label>
          <Input type="date" className="mt-1 w-[150px]" value={ate} onChange={(e) => setAte(e.target.value)} />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filtradas.length} de {linhas.length}</span>
          <ExportCsvButton filename="historico-operacional.csv" rows={csvRows} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Pago</TableHead>
              <TableHead className="text-right">Restante</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Conclusão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <Link href={`/crm/${l.id}`} className="font-medium hover:underline">{l.nome}</Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.cpf ?? "—"}</TableCell>
                  <TableCell>{l.produto ? <Badge variant="secondary">{PRODUTO_LABEL[l.produto]}</Badge> : "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(l.dataEntrada)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(l.valorTotal)}</TableCell>
                  <TableCell className="text-right tabular-nums text-success">{formatCurrency(l.valorPago)}</TableCell>
                  <TableCell className="text-right tabular-nums">{l.valorRestante > 0 ? formatCurrency(l.valorRestante) : "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{l.formaPagamento ? FORMA_PAGAMENTO_LABEL[l.formaPagamento] : "—"}</TableCell>
                  <TableCell><Badge variant="outline">{STATUS_COMERCIAL_LABEL[l.statusComercial] ?? l.statusComercial}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap">{l.dataConclusao ? formatDate(l.dataConclusao) : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
