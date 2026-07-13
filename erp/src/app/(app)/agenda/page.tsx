import { getEventos } from "@/lib/queries/agenda";
import { getClientesBasico, getUsuariosAtivos } from "@/lib/queries/clientes";
import { AgendaClient } from "@/components/agenda/agenda-client";

export default async function AgendaPage() {
  const [eventos, clientes, usuarios] = await Promise.all([
    getEventos(),
    getClientesBasico(),
    getUsuariosAtivos(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
        <p className="text-sm text-muted-foreground">Ligações, cobranças, retornos, documentação e compromissos.</p>
      </div>

      <AgendaClient eventos={eventos} clientes={clientes} usuarios={usuarios} />
    </div>
  );
}
