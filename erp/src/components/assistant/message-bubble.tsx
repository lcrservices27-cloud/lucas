"use client";

import Link from "next/link";
import { Bot, User, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AssistenteUiAction } from "@/lib/assistant/types";

export type Mensagem = {
  id: string;
  papel: "usuario" | "assistente";
  texto: string;
  ui?: AssistenteUiAction;
};

export function MessageBubble({
  mensagem,
  onConfirmar,
  onEditar,
  onCancelarConfirmacao,
  onEscolherClarificacao,
}: {
  mensagem: Mensagem;
  onConfirmar: () => void;
  onEditar: () => void;
  onCancelarConfirmacao: () => void;
  onEscolherClarificacao: (valor: string) => void;
}) {
  const isUsuario = mensagem.papel === "usuario";

  return (
    <div className={cn("flex gap-2", isUsuario && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUsuario ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {isUsuario ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>
      <div className={cn("flex max-w-[85%] flex-col gap-2", isUsuario && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm",
            isUsuario ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {mensagem.texto}
        </div>

        {mensagem.ui?.kind === "confirm" && (
          <Card className="w-full">
            <CardContent className="space-y-3 py-1">
              <p className="text-sm font-medium">{mensagem.ui.titulo}</p>
              <dl className="space-y-1">
                {mensagem.ui.resumo.map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1" onClick={onConfirmar}>
                  <Check className="size-3.5" /> Confirmar
                </Button>
                <Button size="sm" variant="outline" onClick={onEditar}>
                  <Pencil className="size-3.5" /> Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelarConfirmacao}>
                  <X className="size-3.5" /> Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mensagem.ui?.kind === "list" && (
          <Card className="w-full">
            <CardContent className="space-y-1.5 py-1">
              <p className="text-xs font-medium text-muted-foreground">{mensagem.ui.titulo}</p>
              {mensagem.ui.itens.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum resultado.</p>
              ) : (
                mensagem.ui.itens.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.sublabel && <span className="ml-1.5 text-xs text-muted-foreground">{item.sublabel}</span>}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {mensagem.ui?.kind === "clarify" && (
          <Card className="w-full">
            <CardContent className="flex flex-wrap gap-1.5 py-1">
              {mensagem.ui.opcoes.map((op) => (
                <Button key={op.value} size="sm" variant="outline" onClick={() => onEscolherClarificacao(op.value)}>
                  {op.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
