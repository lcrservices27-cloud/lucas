"use client";

import * as React from "react";
import Link from "next/link";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExcluirClienteDialog } from "@/components/crm/excluir-cliente-dialog";
import type { ClienteListItem } from "@/lib/queries/clientes";
import {
  STATUS_COMERCIAL_LABEL,
  STATUS_COMERCIAL_ORDER,
  STATUS_FINANCEIRO_LABEL,
  STATUS_FINANCEIRO_BADGE,
  STATUS_FINANCEIRO_ORDER,
  PRODUTO_LABEL,
} from "@/lib/labels";
import { documentoCliente, formatCurrency, formatDate, initials } from "@/lib/utils";

const baseColumns: ColumnDef<ClienteListItem>[] = [
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Cliente <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/crm/${row.original.id}`} className="flex items-center gap-2.5 hover:underline">
        <Avatar className="size-7">
          <AvatarFallback className="text-[10px]">{initials(row.original.nome)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{documentoCliente(row.original)}</p>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "telefone",
    header: "Contato",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.whatsapp ?? row.original.telefone ?? "—"}</span>
    ),
  },
  {
    accessorKey: "produto",
    header: "Produto",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.produto ? PRODUTO_LABEL[row.original.produto] : "—"}
      </span>
    ),
  },
  {
    accessorKey: "statusComercial",
    header: "Comercial",
    cell: ({ row }) => <Badge variant="outline">{STATUS_COMERCIAL_LABEL[row.original.statusComercial]}</Badge>,
    filterFn: (row, id, value) => value === "all" || row.getValue(id) === value,
  },
  {
    accessorKey: "statusFinanceiro",
    header: "Financeiro",
    cell: ({ row }) => (
      <Badge variant={STATUS_FINANCEIRO_BADGE[row.original.statusFinanceiro]}>
        {STATUS_FINANCEIRO_LABEL[row.original.statusFinanceiro]}
      </Badge>
    ),
    filterFn: (row, id, value) => value === "all" || row.getValue(id) === value,
  },
  {
    accessorKey: "valorContratado",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Valor <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.valorContratado)}</span>,
  },
  {
    accessorKey: "responsavel",
    header: "Responsável",
    cell: ({ row }) => <span className="text-sm">{row.original.responsavel ?? "—"}</span>,
  },
  {
    accessorKey: "dataEntrada",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Entrada <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => <span className="text-sm">{formatDate(row.original.dataEntrada)}</span>,
  },
];

// Só entra na tabela para administradores (a Server Action também exige o papel).
const acoesColumn: ColumnDef<ClienteListItem> = {
  id: "acoes",
  header: () => <span className="sr-only">Ações</span>,
  enableGlobalFilter: false,
  cell: ({ row }) => (
    <div className="flex justify-end">
      <ExcluirClienteDialog clienteId={row.original.id} clienteNome={row.original.nome} iconOnly />
    </div>
  ),
};

export function ClientesTable({
  data,
  initialStatusFinanceiro,
  isAdmin = false,
}: {
  data: ClienteListItem[];
  initialStatusFinanceiro?: string;
  isAdmin?: boolean;
}) {
  const columns = React.useMemo(
    () => (isAdmin ? [...baseColumns, acoesColumn] : baseColumns),
    [isAdmin]
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "dataEntrada", desc: true }]);
  const [statusComercial, setStatusComercial] = React.useState("all");
  const [statusFinanceiro, setStatusFinanceiro] = React.useState(initialStatusFinanceiro || "all");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _id, filterValue) => {
      const q = String(filterValue).toLowerCase();
      const c = row.original;
      return [c.nome, c.cpf, c.cnpj, c.telefone, c.whatsapp]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    },
    initialState: { pagination: { pageSize: 10 } },
  });

  React.useEffect(() => {
    table.getColumn("statusComercial")?.setFilterValue(statusComercial);
  }, [statusComercial, table]);

  React.useEffect(() => {
    table.getColumn("statusFinanceiro")?.setFilterValue(statusFinanceiro);
  }, [statusFinanceiro, table]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, CNPJ, telefone..."
            className="pl-8"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Select value={statusComercial} onValueChange={setStatusComercial}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status comercial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo status comercial</SelectItem>
            {STATUS_COMERCIAL_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_COMERCIAL_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFinanceiro} onValueChange={setStatusFinanceiro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status financeiro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo status financeiro</SelectItem>
            {STATUS_FINANCEIRO_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_FINANCEIRO_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de {data.length} clientes
        </span>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Próxima <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
