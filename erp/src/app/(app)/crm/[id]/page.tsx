import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getClienteDetail } from "@/lib/queries/cliente-detail";
import { ClienteHeader } from "@/components/crm/cliente-header";
import { TabDados } from "@/components/crm/tab-dados";
import { TabFinanceiro } from "@/components/crm/tab-financeiro";
import { TabDocumentos } from "@/components/crm/tab-documentos";
import { TabObservacoes } from "@/components/crm/tab-observacoes";
import { TabTimeline } from "@/components/crm/tab-timeline";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cliente, usuarioAtual] = await Promise.all([getClienteDetail(id), requireUser()]);

  const totalPago = cliente.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
  const saldo = Number(cliente.valorContratado) - totalPago;

  return (
    <div className="space-y-6">
      <ClienteHeader
        cliente={cliente}
        saldo={saldo}
        isAdmin={usuarioAtual.papel === "ADMINISTRADOR"}
      />

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({cliente.documentos.length})</TabsTrigger>
          <TabsTrigger value="observacoes">Observações ({cliente.observacoes.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="dados" className="mt-4">
          <TabDados cliente={cliente} />
        </TabsContent>
        <TabsContent value="financeiro" className="mt-4">
          <TabFinanceiro cliente={cliente} />
        </TabsContent>
        <TabsContent value="documentos" className="mt-4">
          <TabDocumentos cliente={cliente} />
        </TabsContent>
        <TabsContent value="observacoes" className="mt-4">
          <TabObservacoes cliente={cliente} />
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <TabTimeline cliente={cliente} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
