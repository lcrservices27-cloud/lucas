import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClienteDetail } from "@/lib/queries/cliente-detail";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function TabDados({ cliente }: { cliente: ClienteDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Nome" value={cliente.nome} />
          <Field label="CPF" value={cliente.cpf} />
          <Field label="RG" value={cliente.rg} />
          <Field label="Telefone" value={cliente.telefone} />
          <Field label="WhatsApp" value={cliente.whatsapp} />
          <Field label="E-mail" value={cliente.email} />
          <Field label="Cidade" value={cliente.cidade} />
          <Field label="Estado" value={cliente.estado} />
          <Field label="Endereço" value={cliente.endereco} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Comercial</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Origem do lead" value={cliente.origemLead} />
          <Field label="Responsável" value={cliente.responsavel?.nome} />
          <Field label="Data de entrada" value={new Date(cliente.dataEntrada).toLocaleDateString("pt-BR")} />
        </CardContent>
      </Card>
    </div>
  );
}
