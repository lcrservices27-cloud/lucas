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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { clienteSchema, type ClienteFormValues } from "@/lib/validators/cliente";
import { FORMA_PAGAMENTO_LABEL, PRODUTO_LABEL, TIPO_PESSOA_LABEL, TIPO_PESSOA_ORDER } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";

export function ClienteForm({
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
}: {
  defaultValues?: Partial<ClienteFormValues>;
  onSubmit: (data: ClienteFormValues) => Promise<{ error?: string; fieldErrors?: Record<string, string[]> } | void>;
  submitLabel?: string;
}) {
  const form = useForm<z.input<typeof clienteSchema>, unknown, ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipoPessoa: "FISICA",
      nome: "",
      cpf: "",
      cnpj: "",
      telefone: "",
      whatsapp: "",
      endereco: "",
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
  const tipoPessoa = form.watch("tipoPessoa") ?? "FISICA";
  const isEmpresa = tipoPessoa === "JURIDICA";
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
          <Label>Tipo de cliente *</Label>
          <RadioGroup
            className="flex gap-6"
            value={tipoPessoa}
            onValueChange={(v) =>
              form.setValue("tipoPessoa", v as ClienteFormValues["tipoPessoa"], { shouldValidate: true })
            }
          >
            {TIPO_PESSOA_ORDER.map((tipo) => (
              <div key={tipo} className="flex items-center gap-2">
                <RadioGroupItem value={tipo} id={`tipoPessoa-${tipo}`} />
                <Label htmlFor={`tipoPessoa-${tipo}`} className="font-normal">
                  {TIPO_PESSOA_LABEL[tipo]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="col-span-full space-y-1.5">
          <Label htmlFor="nome">{isEmpresa ? "Razão social *" : "Nome completo *"}</Label>
          <Input id="nome" {...form.register("nome")} />
          {form.formState.errors.nome && (
            <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>
          )}
        </div>
        {isEmpresa ? (
          <div className="space-y-1.5">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input id="cnpj" {...form.register("cnpj")} placeholder="00.000.000/0000-00" />
            {form.formState.errors.cnpj && (
              <p className="text-xs text-destructive">{form.formState.errors.cnpj.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" {...form.register("cpf")} placeholder="000.000.000-00" />
            {form.formState.errors.cpf && (
              <p className="text-xs text-destructive">{form.formState.errors.cpf.message}</p>
            )}
          </div>
        )}
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
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" {...form.register("telefone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" {...form.register("whatsapp")} />
        </div>
        <div className="col-span-full space-y-1.5">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" {...form.register("endereco")} />
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
