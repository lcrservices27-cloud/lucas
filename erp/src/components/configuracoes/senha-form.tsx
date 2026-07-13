"use client";

import * as React from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSenha, type SenhaState } from "@/lib/actions/perfil";

const initialState: SenhaState = {};

export function SenhaForm() {
  const [state, formAction, pending] = useActionState(updateSenha, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.success && formRef.current) formRef.current.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="senhaAtual">Senha atual</Label>
        <Input id="senhaAtual" name="senhaAtual" type="password" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="novaSenha">Nova senha</Label>
        <Input id="novaSenha" name="novaSenha" type="password" minLength={6} required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Senha atualizada.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
