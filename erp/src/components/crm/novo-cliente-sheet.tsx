"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
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
import { createCliente } from "@/lib/actions/clientes";
import type { ClienteFormValues } from "@/lib/validators/cliente";

export function NovoClienteSheet() {
  const [open, setOpen] = React.useState(false);

  async function handleSubmit(values: ClienteFormValues) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null) formData.set(key, String(value));
    }
    return createCliente({}, formData);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <UserPlus /> Novo cliente
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Novo cliente</SheetTitle>
          <SheetDescription>Cadastre um novo cliente no CRM.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ClienteForm onSubmit={handleSubmit} submitLabel="Cadastrar cliente" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
