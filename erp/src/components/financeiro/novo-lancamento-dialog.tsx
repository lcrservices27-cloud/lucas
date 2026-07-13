"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createLancamento, type LancamentoState } from "@/lib/actions/lancamentos";

const initialState: LancamentoState = {};

const CATEGORIAS_RECEITA = ["Contrato fechado", "Parcela recebida", "Entrada", "Outro"];
const CATEGORIAS_DESPESA = ["Tráfego pago", "Ferramentas", "Comissão", "Operacional", "Outro"];

export function NovoLancamentoDialog() {
  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState<"RECEITA" | "DESPESA">("RECEITA");
  const [categoria, setCategoria] = React.useState(CATEGORIAS_RECEITA[0]);
  const [state, formAction, pending] = useActionState(createLancamento, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!pending && !state.error && formRef.current) {
      setOpen(false);
      formRef.current.reset();
    }
  }, [pending, state]);

  const categorias = tipo === "RECEITA" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  function handleTipoChange(next: "RECEITA" | "DESPESA") {
    setTipo(next);
    setCategoria(next === "RECEITA" ? CATEGORIAS_RECEITA[0] : CATEGORIAS_DESPESA[0]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Novo lançamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lançamento</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa no fluxo de caixa.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="tipo" value={tipo} />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={tipo === "RECEITA" ? "default" : "outline"} onClick={() => handleTipoChange("RECEITA")}>
              Receita
            </Button>
            <Button type="button" variant={tipo === "DESPESA" ? "default" : "outline"} onClick={() => handleTipoChange("DESPESA")}>
              Despesa
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <input type="hidden" name="categoria" value={categoria} />
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" name="descricao" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" name="valor" type="number" step="0.01" min={0} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input id="data" name="data" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
