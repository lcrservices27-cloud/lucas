import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRODUTO_LABEL, TIPO_PESSOA_LABEL } from "@/lib/labels";
import { formatCnpj, formatCpf } from "@/lib/utils";
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
  const isEmpresa = cliente.tipoPessoa === "JURIDICA";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Tipo de cliente" value={TIPO_PESSOA_LABEL[cliente.tipoPessoa]} />
          <Field label={isEmpresa ? "Razão social" : "Nome"} value={cliente.nome} />
          {isEmpresa ? (
            <Field label="CNPJ" value={formatCnpj(cliente.cnpj)} />
          ) : (
            <Field label="CPF" value={formatCpf(cliente.cpf)} />
          )}
          <Field label="Telefone" value={cliente.telefone} />
          <Field label="WhatsApp" value={cliente.whatsapp} />
          <Field label="Endereço" value={cliente.endereco} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Comercial</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Produto contratado" value={cliente.produto ? PRODUTO_LABEL[cliente.produto] : null} />
          <Field label="Data de entrada" value={new Date(cliente.dataEntrada).toLocaleDateString("pt-BR")} />
        </CardContent>
      </Card>
    </div>
  );
}
