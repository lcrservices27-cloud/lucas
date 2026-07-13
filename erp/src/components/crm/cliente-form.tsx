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
import { FORMA_PAGAMENTO_LABEL } from "@/lib/labels";

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
      valorContratado: 0,
      formaPagamento: "",
      numeroParcelas: undefined,
      ...defaultValues,
    },
  });

  const [pending, setPending] = React.useState(false);

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
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...form.register("cpf")} placeholder="000.000.000-00" />
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
        <div className="space-y-1.5">
          <Label htmlFor="valorContratado">Valor contratado (R$)</Label>
          <Input id="valorContratado" type="number" step="0.01" min={0} {...form.register("valorContratado")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="formaPagamento">Forma de pagamento</Label>
          <Select
            value={form.watch("formaPagamento") || undefined}
            onValueChange={(v) => form.setValue("formaPagamento", v as ClienteFormValues["formaPagamento"])}
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
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="numeroParcelas">Nº de parcelas</Label>
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
