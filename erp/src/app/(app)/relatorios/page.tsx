import { getRelatoriosData } from "@/lib/queries/relatorios";
import { RelatorioOperacional } from "@/components/relatorios/relatorio-operacional";

export default async function RelatoriosPage() {
  const { linhas } = await getRelatoriosData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Histórico operacional completo de clientes e serviços. Filtre e exporte em CSV.
        </p>
      </div>

      <RelatorioOperacional linhas={linhas} />
    </div>
  );
}
