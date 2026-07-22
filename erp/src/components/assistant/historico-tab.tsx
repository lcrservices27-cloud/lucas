"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

type ItemHistorico = {
  id: string;
  transcricao: string;
  resposta: string | null;
  tipoAcao: string | null;
  executada: boolean;
  criadoEm: string;
  usuario: { nome: string } | null;
};

const TIPO_LABEL: Record<string, string> = {
  CRIAR_CLIENTE: "Cadastro",
  REGISTRAR_PAGAMENTO: "Pagamento",
  MOVER_KANBAN: "Kanban",
  BUSCAR_CLIENTES: "Busca",
  ABRIR_CLIENTE: "Abrir cliente",
  RESPONDER_PERGUNTA: "Pergunta",
  RELATORIO: "Relatório",
  CANCELADO: "Cancelado",
  ERRO: "Erro",
};

export function HistoricoTab({ ativo }: { ativo: boolean }) {
  const [itens, setItens] = React.useState<ItemHistorico[] | null>(null);

  React.useEffect(() => {
    if (!ativo || itens !== null) return;
    fetch("/api/assistente/historico")
      .then((r) => r.json())
      .then((data) => setItens(data.historico ?? []))
      .catch(() => setItens([]));
  }, [ativo, itens]);

  if (!ativo) return null;

  if (itens === null) {
    return <p className="p-4 text-sm text-muted-foreground">Carregando histórico...</p>;
  }

  if (itens.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Nenhuma interação registrada ainda.</p>;
  }

  return (
    <div className="space-y-2 overflow-y-auto p-1">
      {itens.map((item) => (
        <div key={item.id} className="rounded-lg border p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {item.tipoAcao && (
                <Badge variant={item.executada ? "success" : "outline"} className="text-[10px]">
                  {TIPO_LABEL[item.tipoAcao] ?? item.tipoAcao}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{item.usuario?.nome ?? "—"}</span>
            </div>
            <span className="text-xs text-muted-foreground">{formatDateTime(item.criadoEm)}</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">&quot;{item.transcricao}&quot;</p>
          {item.resposta && <p className="mt-0.5 text-xs">{item.resposta}</p>}
        </div>
      ))}
    </div>
  );
}
