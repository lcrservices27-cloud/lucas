"use client";

import * as React from "react";
import Link from "next/link";
import { isSameDay } from "date-fns";
import { Phone, Banknote, RotateCcw, FileText, CalendarClock, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { NovoEventoDialog } from "@/components/agenda/novo-evento-dialog";
import { toggleEventoConcluido } from "@/lib/actions/eventos";
import { formatDate } from "@/lib/utils";
import { TIPO_EVENTO_LABEL } from "@/lib/labels";
import type { EventoItem } from "@/lib/queries/agenda";

const ICONS: Record<string, typeof Circle> = {
  LIGACAO: Phone,
  COBRANCA: Banknote,
  RETORNO: RotateCcw,
  DOCUMENTACAO: FileText,
  COMPROMISSO: CalendarClock,
};

export function AgendaClient({
  eventos,
  clientes,
  usuarios,
}: {
  eventos: EventoItem[];
  clientes: { id: string; nome: string }[];
  usuarios: { id: string; nome: string }[];
}) {
  const [selected, setSelected] = React.useState<Date>(new Date());

  const eventosDoDia = eventos
    .filter((e) => isSameDay(e.inicio, selected))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      <Card className="w-fit">
        <CardContent>
          <Calendar
            selected={selected}
            onSelect={setSelected}
            hasEvent={(date) => eventos.some((e) => isSameDay(e.inicio, date))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{formatDate(selected)}</h2>
            <NovoEventoDialog clientes={clientes} usuarios={usuarios} defaultDate={selected} />
          </div>

          {eventosDoDia.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum compromisso para este dia.</p>
          ) : (
            <div className="space-y-2">
              {eventosDoDia.map((e) => {
                const Icon = ICONS[e.tipo] ?? Circle;
                return (
                  <div key={e.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <button
                      onClick={() => toggleEventoConcluido(e.id, !e.concluido)}
                      className="mt-0.5 text-muted-foreground hover:text-foreground"
                    >
                      {e.concluido ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4" />}
                    </button>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${e.concluido ? "line-through text-muted-foreground" : ""}`}>
                        {e.titulo}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {TIPO_EVENTO_LABEL[e.tipo]}
                        </Badge>
                        <span>
                          {e.inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {e.cliente && (
                          <Link href={`/crm/${e.cliente.id}`} className="hover:underline">
                            · {e.cliente.nome}
                          </Link>
                        )}
                        {e.responsavel && <span>· {e.responsavel.nome}</span>}
                      </div>
                      {e.observacao && <p className="mt-1 text-xs text-muted-foreground">{e.observacao}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
