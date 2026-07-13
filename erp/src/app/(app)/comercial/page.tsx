import { getClientesKanban } from "@/lib/queries/kanban";
import { moveClienteComercial } from "@/lib/actions/clientes";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { ClienteKanbanCard } from "@/components/kanban/cliente-kanban-card";
import { STATUS_COMERCIAL_LABEL, STATUS_COMERCIAL_ORDER } from "@/lib/labels";

const columns = STATUS_COMERCIAL_ORDER.map((key) => ({ key, label: STATUS_COMERCIAL_LABEL[key] }));

export default async function ComercialPage() {
  const clientes = await getClientesKanban();
  const items = clientes.map((c) => ({
    id: c.id,
    status: c.statusComercial,
    node: <ClienteKanbanCard cliente={c} />,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kanban Comercial</h1>
        <p className="text-sm text-muted-foreground">Arraste os cartões para atualizar o status automaticamente.</p>
      </div>

      <KanbanBoard columns={columns} items={items} onMove={moveClienteComercial} />
    </div>
  );
}
