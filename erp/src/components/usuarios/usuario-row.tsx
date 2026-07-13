"use client";

import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toggleUsuarioAtivo, updateUsuarioPapel } from "@/lib/actions/usuarios";
import { PAPEL_USUARIO_LABEL } from "@/lib/labels";
import { initials, formatDate } from "@/lib/utils";
import type { UsuarioItem } from "@/lib/queries/usuarios";

export function UsuarioRow({ usuario, isSelf }: { usuario: UsuarioItem; isSelf: boolean }) {
  const [pending, setPending] = React.useState(false);

  async function handleToggleAtivo(checked: boolean) {
    setPending(true);
    try {
      await toggleUsuarioAtivo(usuario.id, checked);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível atualizar.");
    } finally {
      setPending(false);
    }
  }

  async function handlePapelChange(papel: string) {
    setPending(true);
    try {
      await updateUsuarioPapel(usuario.id, papel);
      toast.success("Papel atualizado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível atualizar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(usuario.nome)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {usuario.nome} {isSelf && <span className="text-xs text-muted-foreground">(você)</span>}
            </p>
            <p className="text-xs text-muted-foreground">{usuario.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Select value={usuario.papel} onValueChange={handlePapelChange} disabled={pending || isSelf}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAPEL_USUARIO_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-sm">{usuario._count.clientesResponsavel} clientes</TableCell>
      <TableCell className="text-sm">{usuario._count.tarefasResponsavel} tarefas</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(usuario.criadoEm)}</TableCell>
      <TableCell>
        <Switch checked={usuario.ativo} onCheckedChange={handleToggleAtivo} disabled={pending || isSelf} />
      </TableCell>
    </TableRow>
  );
}
