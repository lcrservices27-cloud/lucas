import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser, PAPEL_LABEL } from "@/lib/auth";
import { PerfilForm } from "@/components/configuracoes/perfil-form";
import { SenhaForm } from "@/components/configuracoes/senha-form";
import { ThemeSelector } from "@/components/configuracoes/theme-selector";

const INTEGRACOES = [
  { nome: "OpenAI", descricao: "Geração de conteúdo e automações com IA" },
  { nome: "Claude (Anthropic)", descricao: "Assistente de IA para atendimento e relatórios" },
  { nome: "WhatsApp Business API", descricao: "Envio e recebimento de mensagens automatizado" },
  { nome: "Evolution API", descricao: "Integração alternativa de WhatsApp" },
  { nome: "n8n", descricao: "Automações e fluxos de trabalho" },
  { nome: "Webhooks / API REST", descricao: "Integrações externas com o ERP" },
];

export default async function ConfiguracoesPage() {
  const usuario = await requireUser();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Perfil, aparência e integrações do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Perfil</CardTitle>
          <CardDescription>
            {PAPEL_LABEL[usuario.papel] ?? usuario.papel} · desde {new Date(usuario.criadoEm).toLocaleDateString("pt-BR")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerfilForm nome={usuario.nome} email={usuario.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Segurança</CardTitle>
          <CardDescription>Altere sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <SenhaForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Aparência</CardTitle>
          <CardDescription>Escolha o tema de exibição do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Integrações</CardTitle>
          <CardDescription>Arquitetura preparada para conexão futura com estes serviços.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {INTEGRACOES.map((i) => (
            <div key={i.nome} className="flex items-start justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{i.nome}</p>
                <p className="text-xs text-muted-foreground">{i.descricao}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                Em breve
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
