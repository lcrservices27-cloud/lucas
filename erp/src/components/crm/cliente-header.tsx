"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ClienteForm } from "@/components/crm/cliente-form";
import { ExcluirClienteDialog } from "@/components/crm/excluir-cliente-dialog";
import { updateCliente } from "@/lib/actions/clientes";
import type { ClienteFormValues } from "@/lib/validators/cliente";
import {
  STATUS_COMERCIAL_LABEL,
  STATUS_FINANCEIRO_LABEL,
  STATUS_FINANCEIRO_BADGE,
  TIPO_PESSOA_LABEL,
} from "@/lib/labels";
import { documentoCliente, formatCurrency, formatDate, initials } from "@/lib/utils";
import type { ClienteDetail } from "@/lib/queries/cliente-detail";

export function ClienteHeader({
  cliente,
  saldo,
  isAdmin = false,
}: {
  cliente: ClienteDetail;
  saldo: number;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  async function handleSubmit(values: ClienteFormValues) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null) formData.set(key, String(value));
    }
    const result = await updateCliente(cliente.id, {}, formData);
    if (!result?.error && !result?.fieldErrors) setOpen(false);
    return result;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="text-lg">{initials(cliente.nome)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{cliente.nome}</h1>
          <p className="text-sm text-muted-foreground">
            {documentoCliente(cliente)} · Cliente desde {formatDate(cliente.dataEntrada)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{TIPO_PESSOA_LABEL[cliente.tipoPessoa]}</Badge>
            <Badge variant="outline">{STATUS_COMERCIAL_LABEL[cliente.statusComercial]}</Badge>
            <Badge variant={STATUS_FINANCEIRO_BADGE[cliente.statusFinanceiro]}>
              {STATUS_FINANCEIRO_LABEL[cliente.statusFinanceiro]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Valor contratado</p>
          <p className="font-semibold">{formatCurrency(Number(cliente.valorContratado))}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p className={`font-semibold ${saldo > 0 ? "text-warning" : "text-success"}`}>{formatCurrency(saldo)}</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil /> Editar
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Editar cliente</SheetTitle>
              <SheetDescription>Atualize os dados cadastrais de {cliente.nome}.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">
              <ClienteForm
                onSubmit={handleSubmit}
                submitLabel="Salvar alterações"
                jaPago={Math.max(0, Number(cliente.valorContratado) - saldo)}
                defaultValues={{
                  tipoPessoa: cliente.tipoPessoa,
                  nome: cliente.nome,
                  cpf: cliente.cpf ?? "",
                  cnpj: cliente.cnpj ?? "",
                  telefone: cliente.telefone ?? "",
                  whatsapp: cliente.whatsapp ?? "",
                  endereco: cliente.endereco ?? "",
                  produto: cliente.produto ?? undefined,
                  valorContratado: Number(cliente.valorContratado),
                  valorPago: 0,
                  formaPagamento: cliente.formaPagamento ?? undefined,
                  numeroParcelas: cliente.numeroParcelas ?? undefined,
                  dataEntrada: new Date(cliente.dataEntrada).toISOString().slice(0, 10),
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
        {isAdmin && (
          <ExcluirClienteDialog clienteId={cliente.id} clienteNome={cliente.nome} redirectToList />
        )}
      </div>
    </div>
  );
}
