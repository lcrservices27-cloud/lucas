"use client";

import * as React from "react";
import { useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createObservacao, type ObservacaoState } from "@/lib/actions/observacoes";
import { formatDateTime, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ClienteDetail } from "@/lib/queries/cliente-detail";

const initialState: ObservacaoState = {};

export function TabObservacoes({ cliente }: { cliente: ClienteDetail }) {
  const [state, formAction, pending] = useActionState(createObservacao, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!pending && !state.error && formRef.current) {
      formRef.current.reset();
    }
  }, [pending, state]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Nova observação</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-3">
            <input type="hidden" name="clienteId" value={cliente.id} />
            <Textarea name="conteudo" placeholder="Escreva uma observação sobre este cliente..." rows={3} required />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Adicionar observação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {cliente.observacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma observação registrada.</p>
        ) : (
          cliente.observacoes.map((o) => (
            <div key={o.id} className="flex gap-3 rounded-lg border bg-card p-4">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">{initials(o.autor?.nome ?? "?")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{o.autor?.nome ?? "Usuário"}</span>
                  <span>{formatDateTime(o.criadoEm)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{o.conteudo}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
