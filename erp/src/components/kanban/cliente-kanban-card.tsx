"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency, initials } from "@/lib/utils";
import type { KanbanCliente } from "@/lib/queries/kanban";

export function ClienteKanbanCard({ cliente }: { cliente: KanbanCliente }) {
  const router = useRouter();

  return (
    <Card className="gap-2 py-3 shadow-sm">
      <CardContent className="px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-7 shrink-0">
              <AvatarFallback className="text-[10px]">{initials(cliente.nome)}</AvatarFallback>
            </Avatar>
            <p className="truncate text-sm font-medium">{cliente.nome}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/crm/${cliente.id}`);
            }}
          >
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
        {cliente.cidade && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" /> {cliente.cidade}/{cliente.estado}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium tabular-nums">{formatCurrency(cliente.valorContratado)}</span>
          {cliente.responsavel && (
            <span className="truncate text-[11px] text-muted-foreground">{cliente.responsavel}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
