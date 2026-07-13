"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registrarPagamento } from "@/lib/actions/pagamentos";
import { TIPO_PAGAMENTO_LABEL, METODO_PAGAMENTO_LABEL } from "@/lib/labels";

type Parcela = { id: string; numero: number; valor: number; status: string };

export function RegistrarPagamentoDialog({ clienteId, parcelas }: { clienteId: string; parcelas: Parcela[] }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const parcelasAbertas = parcelas.filter((p) => p.status !== "PAGA");

  const form = useForm({
    defaultValues: {
      tipo: "PARCELA" as const,
      metodo: "PIX" as const,
      valor: "",
      parcelaId: "",
      observacao: "",
    },
  });

  async function onSubmit(values: {
    tipo: string;
    metodo: string;
    valor: string;
    parcelaId: string;
    observacao: string;
  }) {
    const valor = Number(values.valor);
    if (!valor || valor <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    setPending(true);
    try {
      await registrarPagamento({
        clienteId,
        parcelaId: values.parcelaId || undefined,
        tipo: values.tipo as never,
        metodo: values.metodo as never,
        valor,
        observacao: values.observacao,
      });
      toast.success("Pagamento registrado.");
      setOpen(false);
      form.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Registrar pagamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>O saldo do cliente é atualizado automaticamente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {parcelasAbertas.length > 0 && (
            <div className="space-y-1.5">
              <Label>Parcela (opcional)</Label>
              <Select value={form.watch("parcelaId")} onValueChange={(v) => form.setValue("parcelaId", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pagamento avulso" />
                </SelectTrigger>
                <SelectContent>
                  {parcelasAbertas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      Parcela {p.numero} — R$ {p.valor.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.watch("tipo")} onValueChange={(v) => form.setValue("tipo", v as never)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_PAGAMENTO_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Método</Label>
              <Select value={form.watch("metodo")} onValueChange={(v) => form.setValue("metodo", v as never)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METODO_PAGAMENTO_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input id="valor" type="number" step="0.01" min={0} {...form.register("valor")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea id="observacao" rows={2} {...form.register("observacao")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
