"use client";

import * as React from "react";
import { useActionState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { uploadDocumento, type UploadDocumentoState } from "@/lib/actions/documentos";
import { TIPO_DOCUMENTO_LABEL } from "@/lib/labels";

const initialState: UploadDocumentoState = {};

export function UploadDocumentoDialog({ clienteId }: { clienteId: string }) {
  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState("OUTRO");
  const [state, formAction, pending] = useActionState(uploadDocumento, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!pending && !state.error && formRef.current) {
      setOpen(false);
      formRef.current.reset();
    }
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload /> Enviar documento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
          <DialogDescription>Anexe CPF, RG, contrato, comprovante ou outro arquivo.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="clienteId" value={clienteId} />
          <input type="hidden" name="tipo" value={tipo} />
          <div className="space-y-1.5">
            <Label>Tipo de documento</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_DOCUMENTO_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="arquivo">Arquivo</Label>
            <Input id="arquivo" name="arquivo" type="file" required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
