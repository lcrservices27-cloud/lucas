"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clienteSchema, type ClienteFormValues, ESTADOS_BR } from "@/lib/validators/cliente";
import { FORMA_PAGAMENTO_LABEL, PRODUTO_LABEL } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";

type Usuario = { id: string; nome: string };

export function ClienteForm({
  usuarios,
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
}: {
  usuarios: Usuario[];
  defaultValues?: Partial<ClienteFormValues>;
  onSubmit: (data: ClienteFormValues) => Promise<{ error?: string; fieldErrors?: Record<string, string[]> } | void>;
  submitLabel?: string;
}) {
  const form = useForm<z.input<typeof clienteSchema>, unknown, ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      rg: "",
      telefone: "",
      whatsapp: "",
      email: "",
      cidade: "",
      estado: "",
      endereco: "",
      origemLead: "",
      responsavelId: "",
      produto: undefined,
      valorContratado: 0,
      valorPago: 0,
      formaPagamento: undefined,
      numeroParcelas: undefined,
      dataEntrada: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  });

  const [pending, setPending] = React.useState(false);
  const valorTotal = Number(form.watch("valorContratado")) || 0;
  const valorPago = Number(form.watch("valorPago")) || 0;
  const valorRestante = Math.max(0, valorTotal - valorPago);

  async function handleSubmit(values: ClienteFormValues) {
    setPending(true);
    try {
      const result = await onSubmit(values);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.fieldErrors) {
        for (const [field, errors] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof ClienteFormValues, { message: errors[0] });
        }
      } else {
        toast.success("Cliente salvo com sucesso.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="col-span-full space-y-1.5">
          <Label htmlFor="nome">Nome completo *</Label>
          <Input id="nome" {...form.register("nome")} />
          {form.formState.errors.nome && (
            <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF *</Label>
          <Input id="cpf" {...form.register("cpf")} placeholder="000.000.000-00" />
          {form.formState.errors.cpf && (
            <p className="text-xs text-destructive">{form.formState.errors.cpf.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="produto">Produto contratado *</Label>
          <Select
            value={form.watch("produto") || undefined}
            onValueChange={(v) => form.setValue("produto", v as ClienteFormValues["produto"], { shouldValidate: true })}
          >
            <SelectTrigger id="produto" className="w-full">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRODUTO_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.produto && (
            <p className="text-xs text-destructive">{form.formState.errors.produto.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" {...form.register("rg")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" {...form.register("telefone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" {...form.register("whatsapp")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="origemLead">Origem do lead</Label>
          <Input id="origemLead" {...form.register("origemLead")} placeholder="Instagram Ads, indicação..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" {...form.register("cidade")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={form.watch("estado") || undefined}
            onValueChange={(v) => form.setValue("estado", v)}
          >
            <SelectTrigger id="estado" className="w-full">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_BR.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-full space-y-1.5">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" {...form.register("endereco")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="responsavelId">Responsável</Label>
          <Select
            value={form.watch("responsavelId") || undefined}
            onValueChange={(v) => form.setValue("responsavelId", v)}
          >
            <SelectTrigger id="responsavelId" className="w-full">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-full mt-1 border-t pt-3">
          <p className="text-sm font-semibold text-muted-foreground">Serviço e pagamento</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valorContratado">Valor total do serviço (R$) *</Label>
          <Input id="valorContratado" type="number" step="0.01" min={0} {...form.register("valorContratado")} />
          {form.formState.errors.valorContratado && (
            <p className="text-xs text-destructive">{form.formState.errors.valorContratado.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valorPago">Valor pago / entrada (R$)</Label>
          <Input id="valorPago" type="number" step="0.01" min={0} {...form.register("valorPago")} />
          {form.formState.errors.valorPago && (
            <p className="text-xs text-destructive">{form.formState.errors.valorPago.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Valor restante</Label>
          <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-semibold tabular-nums">
            {formatCurrency(valorRestante)}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dataEntrada">Data da entrada *</Label>
          <Input id="dataEntrada" type="date" {...form.register("dataEntrada")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="formaPagamento">Forma de pagamento *</Label>
          <Select
            value={form.watch("formaPagamento") || undefined}
            onValueChange={(v) => form.setValue("formaPagamento", v as ClienteFormValues["formaPagamento"], { shouldValidate: true })}
          >
            <SelectTrigger id="formaPagamento" className="w-full">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FORMA_PAGAMENTO_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.formaPagamento && (
            <p className="text-xs text-destructive">{form.formState.errors.formaPagamento.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="numeroParcelas">Qtd. de parcelas</Label>
          <Input id="numeroParcelas" type="number" min={1} max={60} {...form.register("numeroParcelas")} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
