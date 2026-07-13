import { getClientesKanban } from "@/lib/queries/kanban";
import { moveClienteJuridico } from "@/lib/actions/clientes";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ClienteKanbanCard } from "@/components/kanban/cliente-kanban-card";
import { STATUS_JURIDICO_LABEL, STATUS_JURIDICO_ORDER } from "@/lib/labels";

const columns = STATUS_JURIDICO_ORDER.map((key) => ({ key, label: STATUS_JURIDICO_LABEL[key] }));

export default async function JuridicoPage() {
  const clientes = await getClientesKanban();
  const items = clientes.map((c) => ({
    id: c.id,
    status: c.statusJuridico,
    node: <ClienteKanbanCard cliente={c} />,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kanban Jurídico</h1>
        <p className="text-sm text-muted-foreground">Acompanhe o andamento dos processos e mova os cartões conforme avançam.</p>
      </div>

      <KanbanBoard columns={columns} items={items} onMove={moveClienteJuridico} />
    </div>
  );
}
