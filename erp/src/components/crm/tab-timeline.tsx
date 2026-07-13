import {
  UserPlus,
  RefreshCw,
  Banknote,
  FileUp,
  MessageSquare,
  ListChecks,
  CheckCircle2,
  LogIn,
  Circle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { TIPO_TIMELINE_LABEL } from "@/lib/labels";
import type { ClienteDetail } from "@/lib/queries/cliente-detail";

const ICONS: Record<string, typeof Circle> = {
  CLIENTE_CRIADO: UserPlus,
  STATUS_ALTERADO: RefreshCw,
  PAGAMENTO_RECEBIDO: Banknote,
  DOCUMENTO_ENVIADO: FileUp,
  OBSERVACAO_CRIADA: MessageSquare,
  TAREFA_CRIADA: ListChecks,
  TAREFA_CONCLUIDA: CheckCircle2,
  LOGIN_REALIZADO: LogIn,
};

export function TabTimeline({ cliente }: { cliente: ClienteDetail }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      {cliente.timelineEntradas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
      ) : (
        <ol className="relative space-y-6 border-l pl-6">
          {cliente.timelineEntradas.map((t) => {
            const Icon = ICONS[t.tipo] ?? Circle;
            return (
              <li key={t.id} className="relative">
                <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground">
                  <Icon className="size-3.5" />
                </span>
                <p className="text-sm">{t.descricao}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {TIPO_TIMELINE_LABEL[t.tipo] ?? t.tipo} · {formatDateTime(t.criadoEm)}
                  {t.usuario ? ` · ${t.usuario.nome}` : ""}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
