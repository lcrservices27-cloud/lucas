"use client";

import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, initials } from "@/lib/utils";
import { PRODUTO_LABEL } from "@/lib/labels";
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
        {cliente.produto && (
          <Badge variant="secondary" className="mt-1.5 text-[10px]">
            {PRODUTO_LABEL[cliente.produto]}
          </Badge>
        )}
        <div className="mt-2 space-y-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium tabular-nums">{formatCurrency(cliente.valorContratado)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pago</span>
            <span className="font-medium tabular-nums text-success">{formatCurrency(cliente.pago)}</span>
          </div>
          {cliente.restante > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Restante</span>
              <span className="font-medium tabular-nums text-warning">{formatCurrency(cliente.restante)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
