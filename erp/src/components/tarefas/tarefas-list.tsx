"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleTarefaConcluida } from "@/lib/actions/tarefas";
import { PRIORIDADE_TAREFA_LABEL, PRIORIDADE_TAREFA_BADGE } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { TarefaItem } from "@/lib/queries/tarefas";

export function TarefasList({ tarefas }: { tarefas: TarefaItem[] }) {
  const pendentes = tarefas.filter((t) => !t.concluida);
  const concluidas = tarefas.filter((t) => t.concluida);

  function Row({ tarefa }: { tarefa: TarefaItem }) {
    const vencida = tarefa.prazo && !tarefa.concluida && tarefa.prazo < new Date();
    return (
      <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
        <button
          onClick={() => toggleTarefaConcluida(tarefa.id, !tarefa.concluida)}
          className="mt-0.5 text-muted-foreground hover:text-foreground"
        >
          {tarefa.concluida ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${tarefa.concluida ? "text-muted-foreground line-through" : ""}`}>
            {tarefa.titulo}
          </p>
          {tarefa.descricao && <p className="text-xs text-muted-foreground">{tarefa.descricao}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={PRIORIDADE_TAREFA_BADGE[tarefa.prioridade]} className="text-[10px]">
              {PRIORIDADE_TAREFA_LABEL[tarefa.prioridade]}
            </Badge>
            {tarefa.prazo && (
              <span className={`text-xs ${vencida ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                Prazo: {formatDate(tarefa.prazo)}
              </span>
            )}
            {tarefa.responsavel && <span className="text-xs text-muted-foreground">· {tarefa.responsavel.nome}</span>}
            {tarefa.cliente && (
              <Link href={`/crm/${tarefa.cliente.id}`} className="text-xs text-muted-foreground hover:underline">
                · {tarefa.cliente.nome}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Pendentes ({pendentes.length})</h2>
        {pendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente.</p>
        ) : (
          <div className="space-y-2">
            {pendentes.map((t) => (
              <Row key={t.id} tarefa={t} />
            ))}
          </div>
        )}
      </div>

      {concluidas.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">Concluídas ({concluidas.length})</h2>
          <div className="space-y-2">
            {concluidas.map((t) => (
              <Row key={t.id} tarefa={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
