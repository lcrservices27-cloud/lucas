"use client";

import * as React from "react";
import { useActionState } from "react";
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
import { createEvento, type EventoState } from "@/lib/actions/eventos";
import { TIPO_EVENTO_LABEL } from "@/lib/labels";

const initialState: EventoState = {};

export function NovoEventoDialog({
  clientes,
  usuarios,
  defaultDate,
}: {
  clientes: { id: string; nome: string }[];
  usuarios: { id: string; nome: string }[];
  defaultDate?: Date;
}) {
  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState("COMPROMISSO");
  const [clienteId, setClienteId] = React.useState("");
  const [responsavelId, setResponsavelId] = React.useState("");
  const [state, formAction, pending] = useActionState(createEvento, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!pending && !state.error && formRef.current) {
      setOpen(false);
      formRef.current.reset();
    }
  }, [pending, state]);

  const dataDefault = (defaultDate ?? new Date()).toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Novo compromisso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo compromisso</DialogTitle>
          <DialogDescription>Adicione um evento à agenda.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="tipo" value={tipo} />
          <input type="hidden" name="clienteId" value={clienteId} />
          <input type="hidden" name="responsavelId" value={responsavelId} />
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_EVENTO_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={responsavelId} onValueChange={setResponsavelId}>
                <SelectTrigger className="w-full">
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
          </div>
          <div className="space-y-1.5">
            <Label>Cliente (opcional)</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input id="data" name="data" type="date" defaultValue={dataDefault} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" name="hora" type="time" defaultValue="09:00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea id="observacao" name="observacao" rows={2} />
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
