import { getTarefas } from "@/lib/queries/tarefas";
import { getClientesBasico, getUsuariosAtivos } from "@/lib/queries/clientes";
import { NovaTarefaDialog } from "@/components/tarefas/nova-tarefa-dialog";
import { TarefasList } from "@/components/tarefas/tarefas-list";

export default async function TarefasPage() {
  const [tarefas, clientes, usuarios] = await Promise.all([
    getTarefas(),
    getClientesBasico(),
    getUsuariosAtivos(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted-foreground">Crie tarefas, atribua responsáveis e acompanhe prazos.</p>
        </div>
        <NovaTarefaDialog clientes={clientes} usuarios={usuarios} />
      </div>

      <TarefasList tarefas={tarefas} />
    </div>
  );
}
