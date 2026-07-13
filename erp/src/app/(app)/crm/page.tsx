import { getClientesList, getUsuariosAtivos } from "@/lib/queries/clientes";
import { ClientesTable } from "@/components/crm/clientes-table";
import { NovoClienteSheet } from "@/components/crm/novo-cliente-sheet";

export default async function CrmPage() {
  const [clientes, usuarios] = await Promise.all([getClientesList(), getUsuariosAtivos()]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Cadastro completo, busca instantânea e filtros.</p>
        </div>
        <NovoClienteSheet usuarios={usuarios} />
      </div>

      <ClientesTable data={clientes} />
    </div>
  );
}
