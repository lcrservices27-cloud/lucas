import { redirect } from "next/navigation";
import { getUsuarios } from "@/lib/queries/usuarios";
import { requireUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NovoUsuarioDialog } from "@/components/usuarios/novo-usuario-dialog";
import { UsuarioRow } from "@/components/usuarios/usuario-row";

export default async function UsuariosPage() {
  const atual = await requireUser();
  if (atual.papel !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }
  const usuarios = await getUsuarios();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerencie a equipe e as permissões por módulo.</p>
        </div>
        <NovoUsuarioDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Carteira</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <UsuarioRow key={u.id} usuario={u} isSelf={u.id === atual.id} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
